import { type Session } from 'next-auth';

// Email placeholder usado por el provider notion-manual.
// NUNCA debe usarse como identificador de usuario en operaciones de seguridad.
const PLACEHOLDER_EMAIL = 'notion@careeros.local';

/**
 * Extrae el userId real y único de una sesión de NextAuth.
 * Si no es posible resolverlo, retorna null (el caller debe rechazar la petición).
 *
 * SEGURIDAD: Se descarta deliberadamente el email de Notion porque es un
 * placeholder estático ('notion@careeros.local') compartido por TODOS los
 * usuarios. Usarlo como fallback haría que todos compartan el mismo bucket
 * de Rate Limit y el mismo acceso Pro en Redis.
 */
export function resolveUserId(session: Session | null): string | null {
  if (!session?.user) return null;

  const id = session.user.id;
  if (id && id.trim().length > 0) return id;

  // Si el email no es el placeholder, úsalo como fallback (caso hipotético futuro)
  const email = session.user.email;
  if (email && email !== PLACEHOLDER_EMAIL && email.trim().length > 0) {
    return email;
  }

  return null;
}
