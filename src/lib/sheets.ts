import { google } from 'googleapis';

/**
 * Añade una fila al Google Sheet de Contabilidad.
 * Estructura esperada de las columnas (Fila 1):
 * A: Fecha | B: User ID | C: Plan | D: Monto | E: Método | F: Estado
 */
export async function appendPaymentRecord(
  userId: string,
  plan: string,
  amount: number,
  method: string,
  status: string
) {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Faltan variables de entorno de Google Sheets");
    }

    // Google scopes requeridos
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    
    // Autenticación usando la llave privada y el correo de la cuenta de servicio
    // El .replace(/\\n/g, '\n') asegura que los saltos de línea de la llave se lean bien desde el .env
    const jwt = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: target
    });

    const sheets = google.sheets({ version: 'v4', auth: jwt });
    
    // Obtener la fecha actual formateada a hora de Colombia
    const dateStr = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    // Añadir los datos a la hoja
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F', // Rango de columnas
      valueInputOption: 'USER_ENTERED', // Formatea automáticamente números y fechas
      requestBody: {
        values: [
          [dateStr, userId, plan, amount, method, status]
        ]
      }
    });

    console.log('[Google Sheets] Fila contable añadida correctamente:', response.data.updates?.updatedRange);
    return true;
  } catch (error) {
    console.error('[Google Sheets] Error al añadir fila contable:', error);
    // Retornamos false pero no crasheamos la app, porque la prioridad 
    // es que el usuario reciba su producto, incluso si falla la contabilidad
    return false;
  }
}
