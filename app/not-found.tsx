import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invitación no encontrada — Bianca 15 años",
  description: "El enlace de invitación no es válido o ya no está disponible.",
};

/**
 * Página 404 global del proyecto.
 *
 * Se muestra cuando:
 *   - Se accede a /i/[token-inexistente] (llamado via notFound())
 *   - Se accede a cualquier ruta que no existe
 */
export default function NotFound() {
  return (
    <main>
      <h1>Invitación no encontrada</h1>

      <p>
        El enlace que utilizaste no es válido
        <br />o ya no está disponible.
      </p>

      <p>
        Si recibiste este enlace por WhatsApp,
        <br />
        contactate con la persona que te lo envió.
      </p>

      <Link href="/">Volver al inicio</Link>
    </main>
  );
}
