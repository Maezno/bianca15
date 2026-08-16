import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/events/get-event-by-slug";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Evento no encontrado",
    };
  }

  return {
    title: `${event.title} — ${event.name}`,
    description: `Invitación digital para ${event.name}`,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "2px", color: "#666" }}>
          {event.title}
        </p>
        <h1 style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>{event.name}</h1>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>
          Plantilla: <code>{event.templateId}</code> | Estado: <code>{event.status}</code>
        </p>
      </header>

      <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />

      <section aria-label="Detalles del evento">
        <h2>Detalles del Evento</h2>
        {event.date && (
          <p>
            <strong>📅 Fecha:</strong> {event.date} {event.startTime && `a las ${event.startTime} hs`}
          </p>
        )}
        {event.location && (
          <p>
            <strong>📍 Lugar:</strong> {event.location}
            {event.address && ` (${event.address})`}
          </p>
        )}
        {event.dressCode && (
          <p>
            <strong>👔 Dress Code:</strong> {event.dressCode}
          </p>
        )}
        {event.giftsText && (
          <p>
            <strong>🎁 Regalos:</strong> {event.giftsText}
          </p>
        )}
      </section>

      <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />

      <footer style={{ textAlign: "center", color: "#999", fontSize: "0.85rem" }}>
        <p>Motor de Invitaciones Digitales Multi-Evento</p>
      </footer>
    </main>
  );
}
