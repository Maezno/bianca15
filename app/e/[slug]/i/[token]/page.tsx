import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGroupByToken } from "@/lib/guests/get-group-by-token";
import { getConfirmationByToken } from "@/lib/confirmations/get-confirmation";
import { ConfirmationForm } from "@/components/confirmation/ConfirmationForm";

export const dynamic = "force-dynamic";

interface EventInvitationPageProps {
  params: Promise<{ slug: string; token: string }>;
}

export async function generateMetadata({
  params,
}: EventInvitationPageProps): Promise<Metadata> {
  const { slug, token } = await params;
  const group = await getGroupByToken(token, slug);

  if (!group) {
    return {
      title: "Invitación no encontrada",
    };
  }

  return {
    title: `${group.event.title} — ${group.event.name}`,
    description: `Invitación personalizada para ${group.event.name}`,
  };
}

export default async function EventInvitationPage({
  params,
}: EventInvitationPageProps) {
  const { slug, token } = await params;

  // Buscar el grupo validando el aislamiento contra el slug del evento
  const group = await getGroupByToken(token, slug);

  // Si el token no existe o pertenece a otro evento → 404
  if (!group) {
    notFound();
  }

  // Obtener confirmación existente (si la hay) mediante token
  const existingConfirmation = await getConfirmationByToken(token);

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Encabezado del evento dinámico */}
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "2px", color: "#666", fontSize: "0.85rem" }}>
          {group.event.title}
        </p>
        <h1 style={{ fontSize: "2.2rem", margin: "0.5rem 0", color: "#1a1a2e" }}>{group.event.name}</h1>
        {group.event.date && (
          <p style={{ color: "#555", fontSize: "0.95rem" }}>
            📅 {group.event.date} {group.event.startTime && `| ⏰ ${group.event.startTime} hs`}
          </p>
        )}
        {group.event.location && (
          <p style={{ color: "#777", fontSize: "0.95rem" }}>
            📍 {group.event.location}
          </p>
        )}
      </header>

      <hr style={{ borderColor: "#f1f5f9", margin: "1.5rem 0" }} />

      {/* Invitación personalizada */}
      <section aria-label="Invitación personalizada" style={{ textAlign: "center", margin: "1.5rem 0" }}>
        <p style={{ color: "#666", fontSize: "1rem" }}>Invitación especial para:</p>
        <h2 style={{ fontSize: "1.8rem", margin: "0.4rem 0", color: "#9333ea" }}>
          {group.name}
        </h2>

        <p style={{ fontSize: "1.05rem", marginTop: "0.75rem", color: "#374151" }}>
          Lugar reservado para:{" "}
          <strong>
            {group.maxGuests} {group.maxGuests === 1 ? "persona" : "personas"}
          </strong>
        </p>
      </section>

      {/* Formulario de confirmación de asistencia interactivo */}
      <section aria-label="Confirmación de asistencia">
        <ConfirmationForm
          token={group.token}
          maxGuests={group.maxGuests}
          groupName={group.name}
          eventTitle={group.event.name}
          existingConfirmation={existingConfirmation}
        />
      </section>
    </main>
  );
}

