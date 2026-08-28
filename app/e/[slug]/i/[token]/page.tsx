import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroupByToken } from '@/lib/guests/get-group-by-token';
import { getConfirmationByToken } from '@/lib/confirmations/get-confirmation';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

interface EventInvitationPageProps {
  params: Promise<{ slug: string; token: string }>;
}

export async function generateMetadata({
  params,
}: EventInvitationPageProps): Promise<Metadata> {
  const { slug, token } = await params;
  const group = await getGroupByToken(token, slug);

  if (!group || group.event.status === 'draft') {
    return {
      title: 'Invitación no encontrada',
    };
  }

  return {
    title: `${group.event.title} — ${group.name}`,
    description: `Invitación personalizada para ${group.name} — ${group.event.name}`,
    openGraph: {
      title: `${group.event.title} — ${group.name}`,
      description: `¡Hola ${group.name}! Te invitamos a celebrar ${group.event.name}. Ingresá para confirmar tu asistencia.`,
      type: 'website',
    },
  };
}

export default async function EventInvitationPage({
  params,
}: EventInvitationPageProps) {
  const { slug, token } = await params;

  // Buscar el grupo validando el aislamiento contra el slug del evento
  const group = await getGroupByToken(token, slug);

  // Si el token no existe o el evento está en borrador → 404
  if (!group || group.event.status === 'draft') {
    notFound();
  }

  // Handle archived events
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
