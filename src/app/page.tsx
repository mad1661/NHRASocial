import Link from "next/link";

import { getCurrentUserContext } from "@/lib/auth/session";

export default async function HomePage() {
  const currentUser = await getCurrentUserContext();

  return (
    <main className="shell">
      <div className="page">
        <section className="hero">
          <span className="eyebrow">NHRA content intelligence</span>
          <div className="hero-grid">
            <div>
              <h1>Autoresearch for what NHRA should post next.</h1>
              <p>
                A race-week operator website that tracks what is working, watches
                competitors, and turns fresh data into next-best-content
                recommendations.
              </p>
              <div className="hero-actions">
                <Link className="button" href={currentUser ? "/dashboard" : "/login"}>
                  {currentUser ? "Open dashboard" : "Sign in"}
                </Link>
                <Link className="button-secondary" href="/login">
                  {currentUser ? "Switch account" : "Create account"}
                </Link>
              </div>
            </div>
            <div className="panel">
              <div className="section-title">
                <h2>What this build includes</h2>
              </div>
              <div className="list">
                <article className="list-item">
                  <h3>Event-day board</h3>
                  <p>Live-style summary of owned performance by platform and content pattern.</p>
                </article>
                <article className="list-item">
                  <h3>Competitor digest</h3>
                  <p>Public pattern tracking for format, timing, and hook velocity.</p>
                </article>
                <article className="list-item">
                  <h3>Recommendation engine</h3>
                  <p>Recency-weighted next actions grounded in race context.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
