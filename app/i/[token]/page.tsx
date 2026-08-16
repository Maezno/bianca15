import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitación — Bianca 15 años",
  description: "Tu invitación personalizada a los 15 años de Bianca.",
};

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  return (
    <main>
      <h1>Invitación personalizada</h1>
      <p>
        Token recibido: <code>{token}</code>
      </p>
      <p>Esta será la invitación personalizada.</p>
    </main>
  );
}
