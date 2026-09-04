import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroupByToken } from '@/lib/guests/get-group-by-token';
import { getConfirmationByToken } from '@/lib/confirmations/get-confirmation';
import { getTemplate, getRegisteredTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

interface PersonalizedInvitationPageProps {
  params: Promise<{ slug: string; token: string }>;
}

export async function generateMetadata({
  params,
}: PersonalizedInvitationPageProps): Promise<Metadata> {
  const { slug, token } = await params;
  const group = await getGroupByToken(token, slug);

  if (!group || group.event.status === 'draft') {
    return {
      title: 'Invitación no encontrada',
      robots: { index: false, follow: false },
    };
  }

  const title = `${group.name} — ${group.event.title}`;
  const description = `¡Hola ${group.name}! Te invitamos a celebrar ${group.event.name}. Ingresá para ver los detalles y confirmar tu asistencia.`;

  return {
    title,
    description,
    // URLs personalizadas con token contienen datos personales (nombre del invitado,
    // cupos familiares, token único). Siempre noindex para proteger la privacidad.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'website',
      images: group.event.coverImage ? [{ url: group.event.coverImage, alt: group.event.name }] : [],
    },
    twitter: {
      card: group.event.coverImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: group.event.coverImage ? [group.event.coverImage] : [],
    },
  };
}

export default async function PersonalizedInvitationPage({
  params,
}: PersonalizedInvitationPageProps) {
  const { slug, token } = await params;

  // Buscar el grupo validando el aislamiento contra el slug del evento
  const group = await getGroupByToken(token, slug);

  // Si el token no existe o el evento está en borrador → 404
  if (!group || group.event.status === 'draft') {
    notFound();
  }

  // Manejo de eventos archivados
  if (group.event.status === 'archived') {
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
            La invitación para <strong>{group.name}</strong> en <strong>{group.event.name}</strong> ya no se encuentra activa.
          </p>
        </div>
      </main>
    );
  }

  // Obtener confirmación existente (si la hay) mediante token
  const existingConfirmation = await getConfirmationByToken(token);

  // Si el template_id está seteado explícitamente pero no existe en el registro
  const hasExplicitTemplate = group.event.templateId && group.event.templateId !== 'default';
  if (hasExplicitTemplate && !getRegisteredTemplate(group.event.templateId)) {
    console.error(`[template] templateId inválido: "${group.event.templateId}" en evento ${group.event.slug}`);
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

  // Resolver plantilla dinámicamente
  const template = getTemplate(group.event.templateId);
  const InvitationPageComponent = template.InvitationPage;

  return (
    <InvitationPageComponent
      event={group.event}
      guestGroup={group}
      existingConfirmation={existingConfirmation}
    />
  );
}
