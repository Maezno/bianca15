import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface LegacyEventPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

export default async function LegacyEventPage({
  params,
  searchParams,
}: LegacyEventPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === 'true';

  redirect(`/invitacion/${slug}${isPreview ? '?preview=true' : ''}`);
}
