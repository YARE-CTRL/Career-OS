/**
 * fingerprint.ts
 * Genera una huella digital unica del navegador usando FingerprintJS Open Source.
 * Esta huella es estable y sobrevive al modo incognito, ya que se basa en
 * caracteristicas del hardware y del entorno del navegador, no en cookies.
 */

let cachedVisitorId: string | null = null;

export async function getVisitorId(): Promise<string> {
  // Retornar cache en memoria para evitar recalcular en la misma sesion
  if (cachedVisitorId) return cachedVisitorId;

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedVisitorId = result.visitorId;
    return cachedVisitorId;
  } catch (err) {
    // Si FingerprintJS falla (ej. bloqueado por ad-blocker), retornar un
    // valor de fallback basado en caracteristicas basicas del navegador.
    console.warn('[fingerprint] FingerprintJS fallo, usando fallback:', err);
    const fallback = [
      navigator.language,
      navigator.platform,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join('|');

    // Hash simple del fallback
    let hash = 0;
    for (let i = 0; i < fallback.length; i++) {
      const char = fallback.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    cachedVisitorId = `fb-${Math.abs(hash).toString(36)}`;
    return cachedVisitorId;
  }
}
