import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/lib/events/get-event-by-slug';
import { getTemplate, getRegisteredTemplate } from '@/templates/registry';
import { LiveInvitationPage } from '@/components/invitation/LiveInvitationPage';

export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === 'true';

  const event = await getEventBySlug(slug);

  if (!event || (event.status === 'draft' && !isPreview)) {
    return {
      title: 'Invitación no encontrada',
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = `${event.title} — ${event.name}`;
  const pageDesc = event.subtitle || event.welcomeText || `Invitación digital para ${event.name}. Ingresá para ver todos los detalles.`;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'website',
      images: event.coverImage ? [{ url: event.coverImage, alt: event.name }] : [],
    },
    twitter: {
      card: event.coverImage ? 'summary_large_image' : 'summary',
      title: pageTitle,
      description: pageDesc,
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function PublicEventPage({
  params,
  searchParams,
}: EventPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === 'true';

  const event = await getEventBySlug(slug);

  // Drafts sin preview o evento inexistente -> 404 estricto sin filtrar datos
  if (!event || (event.status === 'draft' && !isPreview)) {
    notFound();
  }

  // Manejo de eventos archivados
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

  // Si el template_id está seteado explícitamente pero no existe en el registro
  const hasExplicitTemplate = event.templateId && event.templateId !== 'default';
  if (hasExplicitTemplate && !getRegisteredTemplate(event.templateId)) {
    console.error(`[template] templateId inválido: "${event.templateId}" en evento ${event.slug}`);
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
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🔧</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Invitación no disponible
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
            Esta invitación no está disponible temporalmente. Por favor, intentá nuevamente más tarde.
          </p>
        </div>
      </main>
    );
  }

  return <LiveInvitationPage initialEvent={event} isPreview={isPreview} />;
}
