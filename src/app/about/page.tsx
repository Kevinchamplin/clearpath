import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — ClearPath",
  description:
    "Why ClearPath exists: the May 2026 Mendota train blockage and our mission to give first responders a heads-up before crossings close.",
};

export default function AboutPage() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--text)" }}>
      <style>{`
        .about-hero {
          background: #0f172a;
          color: #fff;
          padding: 4rem 1.5rem 3.5rem;
          text-align: center;
        }
        .about-hero h1 {
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .about-hero p {
          font-size: 1.125rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .about-content {
          max-width: 780px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .incident-card {
          background: var(--surface);
          border-left: 4px solid var(--blocked);
          border-radius: 0 var(--radius) var(--radius) 0;
          box-shadow: var(--shadow-md);
          padding: 1.75rem 2rem;
          margin-bottom: 3rem;
        }
        .incident-card .date-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--blocked);
          margin-bottom: 0.5rem;
        }
        .incident-card h2 {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .incident-card p {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .incident-card p:last-of-type {
          margin-bottom: 1.25rem;
        }
        blockquote.pull-quote {
          margin: 1.25rem 0 0;
          padding: 1.25rem 1.5rem;
          background: var(--blocked-light);
          border-radius: var(--radius);
          font-style: italic;
          font-size: 1.0625rem;
          line-height: 1.7;
          color: var(--text);
        }
        blockquote.pull-quote cite {
          display: block;
          margin-top: 0.75rem;
          font-size: 0.875rem;
          font-style: normal;
          font-weight: 600;
          color: var(--text-muted);
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 1.5rem 1.25rem;
          text-align: center;
        }
        .stat-card .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--blocked);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .stat-card .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .section-heading {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--text);
        }
        .quotes-section {
          margin-bottom: 3rem;
        }
        .quotes-section blockquote.pull-quote {
          background: #f8fafc;
          border-left: 4px solid var(--approaching);
          border-radius: 0 var(--radius) var(--radius) 0;
          margin-bottom: 1rem;
        }
        .feature-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 1.5rem;
        }
        .feature-card .icon {
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          display: block;
        }
        .feature-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0;
        }
        .oss-card {
          background: #0f172a;
          color: #fff;
          border-radius: var(--radius);
          padding: 2rem;
          margin-bottom: 3rem;
          text-align: center;
        }
        .oss-card h2 {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .oss-card p {
          color: #94a3b8;
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        .oss-card a {
          display: inline-block;
          background: #fff;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.9375rem;
          text-decoration: none;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          transition: opacity 0.15s;
        }
        .oss-card a:hover { opacity: 0.85; }
        .builder-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 1.5rem;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .builder-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0f172a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.375rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .builder-info h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .builder-info p {
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .builder-info a {
          color: var(--blue);
          font-size: 0.9375rem;
        }
        .source-note {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          line-height: 1.6;
        }
      `}</style>

      {/* Hero */}
      <section className="about-hero">
        <h1>When Trains Stop,<br />So Does Everything Else</h1>
        <p>
          ClearPath was built in Mendota, IL after a BNSF freight train blocked
          every grade crossing in town for over 4 hours.
        </p>
      </section>

      <div className="about-content">

        {/* The Incident */}
        <article className="incident-card">
          <div className="date-label">May 28, 2026 — Mendota, Illinois</div>
          <h2>The Incident</h2>
          <p>
            A BNSF freight train stopped and blocked every downtown rail crossing
            in Mendota for nearly four hours. During that time, emergency vehicles
            could not cross. The only alternative route — the 4th Avenue Viaduct —
            cannot accommodate larger fire apparatus, which means a structure fire
            or cardiac arrest on the wrong side of the tracks could turn fatal.
          </p>
          <p>
            Mendota Fire Chief Dennis Rutishauser described the situation plainly
            in an interview with the LaSalle NewsTribune on June 23, 2026:
          </p>
          <blockquote className="pull-quote">
            "Whenever trains are stopped, all downtown crossings are blocked for
            a considerable amount of time."
            <cite>— Chief Dennis Rutishauser, Mendota Fire Department</cite>
          </blockquote>
        </article>

        {/* Stats */}
        <h2 className="section-heading">Why It Matters</h2>
        <div className="stats-row">
          <article className="stat-card">
            <div className="stat-number">4+</div>
            <div className="stat-label">Hours — longest single blockage recorded in 2026</div>
          </article>
          <article className="stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Crossings blocked simultaneously during the May incident</div>
          </article>
          <article className="stat-card">
            <div className="stat-number">25%</div>
            <div className="stat-label">Increase in average freight train length since 2010 (GAO, 2019)</div>
          </article>
        </div>

        {/* Quotes */}
        <section className="quotes-section">
          <h2 className="section-heading">Other Chiefs. Same Problem.</h2>
          <blockquote className="pull-quote">
            "Fire can sometimes quadruple in size every minute."
            <cite>— Chief Scott Etheridge, Princeton Fire Department</cite>
          </blockquote>
          <blockquote className="pull-quote" style={{ marginTop: "1rem" }}>
            Ottawa, Princeton, Streator, La Salle — every Illinois Valley community
            that depends on rail crossings for emergency access faces the same vulnerability.
            <cite>— Chief Brian Bressner, Ottawa Fire Department</cite>
          </blockquote>
        </section>

        {/* Feature Cards */}
        <h2 className="section-heading">What ClearPath Does</h2>
        <div className="feature-cards">
          <article className="feature-card">
            <span className="icon">🚦</span>
            <h3>Live Train Tracking</h3>
            <p>
              Polls Amtrak positions every 30 seconds via amtraker.com. Calculates
              ETA to each crossing using haversine distance ÷ speed.
            </p>
          </article>
          <article className="feature-card">
            <span className="icon">📷</span>
            <h3>Freight Detection</h3>
            <p>
              Computer vision (YOLO) watches the Steel Highway railcam. Writes
              CLEAR or BLOCKED every 30 seconds. Best-effort — not authoritative.
            </p>
          </article>
          <article className="feature-card">
            <span className="icon">🚨</span>
            <h3>Dispatch View</h3>
            <p>
              High-contrast tablet screen for fire trucks: blocked crossings,
              ETAs, and live community reports — no map clutter.
            </p>
          </article>
        </div>

        {/* Open Source */}
        <div className="oss-card">
          <h2>Free. Open Source. Forkable.</h2>
          <p>
            ClearPath is free, open source, and forkable for any town.
            Edit one config file and deploy on Vercel in under 30 minutes.
          </p>
          <a
            href="https://github.com/Kevinchamplin/clearpath"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub →
          </a>
        </div>

        {/* Builder */}
        <h2 className="section-heading">Meet the Builder</h2>
        <article className="builder-card">
          <div className="builder-avatar">KC</div>
          <div className="builder-info">
            <h3>Kevin Champlin</h3>
            <p>
              Built in Mendota, IL. Kevin is a software engineer and founder at
              Champlin Enterprises. ClearPath started as a response to the May 28
              incident and grew from there.
            </p>
            <a href="mailto:kevin@kevinchamplin.com">kevin@kevinchamplin.com</a>
          </div>
        </article>

        <p className="source-note">
          Sources: LaSalle NewsTribune, June 23, 2026 — reporting by the Illinois
          Valley news team on grade crossing safety and the May 28 Mendota blockage.
          GAO Report GAO-19-443: Freight Railroads — National Train Length Data.
        </p>
      </div>
    </main>
  );
}
