import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plataforma de Invitaciones Digitales",
  description: "Motor multi-evento de invitaciones web interactivas.",
};

export default function HomePage() {
  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Plataforma de Invitaciones Digitales
        </h1>
        <p style={{ color: "#555", fontSize: "1.2rem" }}>
          Motor multi-evento y multi-tenant para invitaciones interactivas
        </p>
      </header>

      <section style={{ background: "#f8f9fa", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.4rem", marginTop: 0 }}>🎉 Eventos de Demostración Activos</h2>
        <p style={{ color: "#666" }}>
          Cada evento funciona de manera 100% aislada compartiendo la misma infraestructura:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
          {/* Evento 1: Bianca */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#2b6cb0" }}>Bianca - 15 años</h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#718096" }}>
              Slug: <code>bianca-15</code> | Template: <code>wonderland</code>
            </p>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <li>
                <Link href="/e/bianca-15" style={{ color: "#3182ce" }}>
                  Portada pública
                </Link>
              </li>
              <li>
                <Link href="/e/bianca-15/i/perez-test1" style={{ color: "#3182ce" }}>
                  Invitación Familia Pérez (5 cupos)
                </Link>
              </li>
              <li>
                <Link href="/e/bianca-15/i/garcia-test2" style={{ color: "#3182ce" }}>
                  Invitación Familia García (2 cupos)
                </Link>
              </li>
            </ul>
          </div>

          {/* Evento 2: Juan y María */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#805ad5" }}>Juan y María - Boda</h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#718096" }}>
              Slug: <code>juan-y-maria</code> | Template: <code>elegant</code>
            </p>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <li>
                <Link href="/e/juan-y-maria" style={{ color: "#6b46c1" }}>
                  Portada pública
                </Link>
              </li>
              <li>
                <Link href="/e/juan-y-maria/i/rodriguez-boda" style={{ color: "#6b46c1" }}>
                  Invitación Familia Rodríguez (4 cupos)
                </Link>
              </li>
              <li>
                <Link href="/e/juan-y-maria/i/carlos-individual" style={{ color: "#6b46c1" }}>
                  Invitación Carlos Gómez (1 cupo)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ textAlign: "center", color: "#718096", fontSize: "0.9rem" }}>
        <p>
          Prueba de Aislamiento: Entrar a{" "}
          <Link href="/e/juan-y-maria/i/perez-test1" style={{ color: "#e53e3e" }}>
            /e/juan-y-maria/i/perez-test1
          </Link>{" "}
          devuelve <strong>404</strong> porque la Familia Pérez pertenece a Bianca.
        </p>
      </section>
    </main>
  );
}
