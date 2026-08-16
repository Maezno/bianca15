import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel administrativo — Bianca 15 años",
  description: "Panel privado de administración del evento.",
};

export default function AdminPage() {
  return (
    <main>
      <h1>Panel administrativo</h1>
      <p>Área privada.</p>
    </main>
  );
}
