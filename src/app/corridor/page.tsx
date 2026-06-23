import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Illinois Valley Corridor — ClearPath",
  description:
    "BNSF's Chicago–Aurora–Galesburg mainline passes through 5+ Illinois Valley communities. Each faces the same blocked-crossing problem.",
};

const towns = [
  {
    name: "Ottawa",
    county: "LaSalle County",
    crossings: "~8 at-grade crossings",
    official: "Fire Chief Brian Bressner on record",
    isCurrent: false,
    link: null,
  },
  {
    name: "Princeton",
    county: "Bureau County",
    crossings: "~6 at-grade crossings",
    official: "Fire Chief Scott Etheridge on record",
    isCurrent: false,
    link: null,
  },
  {
    name: "Mendota",
    county: "LaSalle County",
    crossings: "4 monitored crossings",
    official: "Fire Chief Dennis Rutishauser — May 28 incident site",
    isCurrent: true,
    link: "/",
  },
  {
    name: "Streator",
    county: "LaSalle County",
    crossings: "~10 at-grade crossings",
    official: "Police Chief Robert Wood on record",
    isCurrent: false,
    link: null,
  },
  {
    name: "La Salle",
    county: "LaSalle County",
    crossings: "~5 at-grade crossings",
    official: null,
    isCurrent: false,
    link: null,
  },
];

export default function CorridorPage() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--text)" }}>
      <style>{`
        .corridor-hero {
          background: #0f172a;
          color: #fff;
          padding: 3.5rem 1.5rem 3rem;
          text-align: center;
        }
        .corridor-hero h1 {
          font-size: clamp(1.625rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.875rem;
        }
        .corridor-hero p {
          font-size: 1.0625rem;
          color: #94a3b8;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .corridor-content {
          max-width: 820px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .section-heading {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        /* Town grid */
        .town-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .town-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 1.25rem 1.5rem;
          position: relative;
          transition: box-shadow 0.15s;
        }
        .town-card:hover {
          box-shadow: var(--shadow-md);
        }
        .town-card.current {
          border-color: #3b82f6;
          border-width: 2px;
        }
        .town-card .current-badge {
          position: absolute;
          top: -1px;
          right: 12px;
          background: #1d4ed8;
          color: #fff;
          font-size: 0.6875rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.625rem;
          border-radius: 0 0 6px 6px;
        }
        .town-card h2 {
          font-size: 1.125rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .town-card .county {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-bottom: 0.625rem;
        }
        .town-card .crossings-count {
          display: inline-block;
          font-size: 0.8125rem;
          font-weight: 600;
          background: #f1f5f9;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.2rem 0.6rem;
          margin-bottom: 0.625rem;
        }
        .town-card .official {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.875rem;
        }
        .town-fork-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--blue);
          text-decoration: none;
        }
        .town-fork-link:hover { text-decoration: underline; }
        /* Shared problem */
        .problem-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 2rem;
          margin-bottom: 3rem;
        }
        .problem-section h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .problem-section p {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .problem-section p:last-child { margin-bottom: 0; }
        .stat-inline {
          display: inline-block;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--blocked);
        }
        /* Fork section */
        .fork-section {
          background: #0f172a;
          color: #fff;
          border-radius: var(--radius);
          padding: 2.5rem 2rem;
          margin-bottom: 2rem;
        }
        .fork-section h2 {
          font-size: 1.375rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }
        .fork-section > p {
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 1.75rem;
        }
        .fork-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .fork-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .fork-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 0.8125rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .fork-step-body strong {
          display: block;
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.25rem;
        }
        .fork-step-body span {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
        }
        .fork-step-body code {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 0.1rem 0.4rem;
          font-size: 0.8125rem;
          color: #e2e8f0;
        }
        .fork-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.9375rem;
          text-decoration: none;
          padding: 0.875rem 1.75rem;
          border-radius: 8px;
          transition: opacity 0.15s;
        }
        .fork-cta:hover { opacity: 0.88; }
        @media (max-width: 600px) {
          .town-grid { grid-template-columns: 1fr; }
          .fork-section { padding: 1.5rem; }
        }
      `}</style>

      {/* Hero */}
      <section className="corridor-hero">
        <h1>The Illinois Valley Corridor</h1>
        <p>
          BNSF&apos;s Chicago–Aurora–Galesburg mainline passes through 5+ Illinois
          Valley communities. Each faces the same problem.
        </p>
      </section>

      <div className="corridor-content">

        {/* Town grid */}
        <h2 className="section-heading">Towns in the Corridor</h2>
        <div className="town-grid">
          {towns.map((town) => (
            <article key={town.name} className={`town-card${town.isCurrent ? ' current' : ''}`}>
              {town.isCurrent && <div className="current-badge">Active ↗</div>}
              <h2>
                {town.link ? (
                  <a href={town.link} style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                    {town.name}
                  </a>
                ) : town.name}
              </h2>
              <div className="county">{town.county}</div>
              <div className="crossings-count">{town.crossings}</div>
              {town.official && <div className="official">{town.official}</div>}
              <a
                href="https://github.com/Kevinchamplin/clearpath"
                target="_blank"
                rel="noopener noreferrer"
                className="town-fork-link"
              >
                Fork for {town.name} →
              </a>
            </article>
          ))}
        </div>

        {/* Shared problem */}
        <section className="problem-section">
          <h2>The Shared Problem</h2>
          <p>
            Longer trains, same infrastructure. A 2019 GAO report found that the
            average freight train length increased{' '}
            <span className="stat-inline">~25%</span>{' '}
            between 2008 and 2017. Trains that once blocked a crossing for 10 minutes
            now block it for 30 or more.
          </p>
          <p>
            Every Illinois Valley community has the same exposure: BNSF mainline
            freight runs at-grade through downtown streets, and fire apparatus
            routes depend on those crossings. When a train stops — whether for a
            mechanical issue, crew rest, or signal hold — emergency response stops
            with it.
          </p>
          <p>
            Princeton Fire Chief Scott Etheridge put the stakes plainly: &ldquo;Fire can
            sometimes quadruple in size every minute.&rdquo; A 30-minute blockage
            is not an inconvenience. It is a public safety crisis.
          </p>
        </section>

        {/* Fork ClearPath */}
        <div className="fork-section">
          <h2>Fork ClearPath for Your Town</h2>
          <p>
            ClearPath is free, open source, and built to be forked. You can have a
            live crossing monitor for your town in under 30 minutes — for free.
          </p>
          <div className="fork-steps">
            <div className="fork-step">
              <div className="fork-step-num">1</div>
              <div className="fork-step-body">
                <strong>Fork on GitHub</strong>
                <span>
                  <code>git clone https://github.com/Kevinchamplin/clearpath</code>
                </span>
              </div>
            </div>
            <div className="fork-step">
              <div className="fork-step-num">2</div>
              <div className="fork-step-body">
                <strong>Edit <code>src/config/town.ts</code></strong>
                <span>
                  Set your town name, center lat/lng, and grade crossings using
                  FRA crossing IDs. Set <code>watchTrains</code> to the Amtrak
                  trains that run through your town.
                </span>
              </div>
            </div>
            <div className="fork-step">
              <div className="fork-step-num">3</div>
              <div className="fork-step-body">
                <strong>Deploy on Vercel — free</strong>
                <span>
                  Push to GitHub, import in vercel.com. No credit card required.
                  Share the URL with your fire department and dispatch.
                </span>
              </div>
            </div>
          </div>
          <a
            href="https://github.com/Kevinchamplin/clearpath"
            target="_blank"
            rel="noopener noreferrer"
            className="fork-cta"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Source: LaSalle NewsTribune, June 23, 2026. GAO Report GAO-19-443: Freight Railroads — National Train Length Data, 2019.
        </p>

      </div>
    </main>
  );
}
