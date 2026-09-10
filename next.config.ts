import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/(.*)",
        headers: [
          // Previene Clickjacking: el sitio no puede embeberse en un <iframe>
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Previene MIME-sniffing: el browser respeta el Content-Type declarado
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Evita que el header Referer filtre URLs con datos sensibles (ej: tokens)
          // a servidores de terceros (analytics, CDNs, etc.)
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Previene ataques de cross-site scripting mediante una política de permisos
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HSTS: Fuerza HTTPS por 1 año. Solo activo en producción (Vercel lo hace).
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content Security Policy básica: bloquea recursos de orígenes no autorizados.
          // 'unsafe-inline' requerido para estilos de Framer Motion y Tailwind en runtime.
          // 'unsafe-eval' requerido por Next.js en desarrollo; en producción se puede
          // eliminar si se usa nonces, pero aquí mantenemos compatibilidad.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.notion.com https://api.stripe.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
