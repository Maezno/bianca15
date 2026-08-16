import { notFound, redirect } from "next/navigation";
import { getGroupByToken } from "@/lib/guests/get-group-by-token";

export const dynamic = "force-dynamic";

interface DirectInvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function DirectInvitationPage({
  params,
}: DirectInvitationPageProps) {
  const { token } = await params;

  // Buscar el grupo de forma global por su token único
  const group = await getGroupByToken(token);

  if (!group || !group.event?.slug) {
    notFound();
  }

  // Redirigir a la URL canónica del evento
  redirect(`/e/${group.event.slug}/i/${group.token}`);
}
