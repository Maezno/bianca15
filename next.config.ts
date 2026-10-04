import type { NextConfig } from "next";

/* Cabeceras de seguridad aplicadas a todas las rutas */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Solo nuestro propio sitio puede embeber páginas en iframes (el editor usa el preview)
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  /* Configuración del proyecto Bianca 15 */
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El panel admin no debe indexarse en buscadores
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Invitaciones personales (con token) tampoco deben indexarse
      { source: "/invitacion/:slug/:token", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/i/:token", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
