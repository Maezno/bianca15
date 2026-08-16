import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bianca — Mis 15 años",
  description: "Invitación web interactiva para los 15 años de Bianca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
