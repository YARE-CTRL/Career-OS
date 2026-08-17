/**
 * Tipos compartidos para el dominio de Notion.
 * Exportados aquí para ser consumidos tanto por el frontend (store, componentes)
 * como por los tests, sin crear dependencias circulares con la capa de API.
 */

/** Página de Notion autorizada por el usuario durante el flujo OAuth. */
export interface NotionPageDTO {
  id: string;          // UUID de la página en Notion
  title: string;       // Título en texto plano (fallback: "Sin título")
  url: string;         // URL pública de la página (notion.so/...)
  lastEdited: string;  // ISO 8601 timestamp de última edición
}
