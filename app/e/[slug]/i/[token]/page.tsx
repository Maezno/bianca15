import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface LegacyEventInvitationPageProps {
  params: Promise<{ slug: string; token: string }>;
}

export default async function LegacyEventInvitationPage({
  params,
}: LegacyEventInvitationPageProps) {
  const { slug, token } = await params;
  redirect(`/invitacion/${slug}/${token}`);
}
