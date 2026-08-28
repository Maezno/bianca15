import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/lib/events/get-event-by-slug';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.status === 'draft') {
    return {
      title: 'Evento no encontrado',
    };
  }

  return {
    title: `${event.title} — ${event.name}`,
    description: `Invitación digital para ${event.name}`,
    openGraph: {
      title: `${event.title} — ${event.name}`,
      description: `Invitación digital para ${event.name}. Ingresá para ver todos los detalles.`,
      type: 'website',
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.status === 'draft') {
    notFound();
  }

  // Handle archived events
  if (event.status === 'archived') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            padding: '2.5rem 2rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>⌛</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Evento Finalizado
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
            La invitación para <strong>{event.name}</strong> ya no se encuentra activa.
          </p>
        </div>
      </main>
    );
  }

  // Resolve template dynamically
  const template = getTemplate(event.templateId);
  const EventPageComponent = template.EventPage;

  return <EventPageComponent event={event} />;
}
