import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGroupByToken } from "@/lib/guests/get-group-by-token";

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

  const confirmationLabel =
    group.confirmation?.status === "confirmed"
      ? "Confirmada ✓"
      : group.confirmation?.status === "declined"
        ? "No asistirá"
        : "Pendiente";

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Encabezado del evento dinámico */}
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "2px", color: "#666" }}>
          {group.event.title}
        </p>
        <h1 style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>{group.event.name}</h1>
        {group.event.date && (
          <p style={{ color: "#555" }}>
            📅 {group.event.date} {group.event.startTime && `| ⏰ ${group.event.startTime} hs`}
          </p>
        )}
        {group.event.location && (
          <p style={{ color: "#777", fontSize: "0.95rem" }}>
            📍 {group.event.location}
          </p>
        )}
      </header>

      <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />

      {/* Invitación personalizada */}
      <section aria-label="Invitación personalizada" style={{ textAlign: "center", margin: "2rem 0" }}>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>Invitación para:</p>
        <h2 style={{ fontSize: "1.8rem", margin: "0.5rem 0", color: "#111" }}>
          {group.name}
        </h2>

        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
          Tenemos reservado lugar para:{" "}
          <strong>
            {group.maxGuests} {group.maxGuests === 1 ? "persona" : "personas"}
          </strong>
        </p>
      </section>

      {/* Lista de invitados asociados al grupo */}
      {group.guests.length > 0 && (
        <section aria-label="Invitados">
          <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />
          <h3>Invitados:</h3>
          <ul style={{ lineHeight: "1.8" }}>
            {group.guests.map((guest) => (
              <li key={guest.id}>{guest.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Estado de confirmación (solo lectura en esta fase) */}
      <section aria-label="Estado de confirmación" style={{ marginTop: "1.5rem" }}>
        <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />
        <p>
          Estado actual: <strong>{confirmationLabel}</strong>
        </p>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>
          <em>Próximamente podrás confirmar tu asistencia desde aquí.</em>
        </p>
      </section>
    </main>
  );
}
