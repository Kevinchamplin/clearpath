import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — ClearPath",
  description:
    "ClearPath polls Amtrak train positions every 30 seconds, calculates ETAs to each grade crossing, and flags camera-based freight detection from the Steel Highway railcam.",
};

const steps = [
  {
    number: "01",
    tag: "Data source",
    title: "Amtrak Data",
    body: "We poll amtraker.com every 30 seconds for the live GPS position, speed, and bearing of Amtrak trains on the Illinois corridor. This is publicly available data — no scraping.",
  },
  {
    number: "02",
    tag: "Math",
    title: "ETA Math",
    body: "Haversine distance from the train's current position to each monitored crossing, divided by the train's reported speed, gives estimated arrival in minutes. ETAs update every poll cycle.",
  },
  {
    number: "03",
    tag: "Alerting",
    title: "Alert Threshold",
    body: "When a train is within 10 miles AND less than 20 minutes out, the crossing flips to APPROACHING. That window is enough to stage apparatus on the correct side or reroute a response.",
  },
  {
    number: "04",
    tag: "Computer vision",
    title: "Freight Camera",
    body: "A YOLO model watches the public Steel Highway railcam and writes CLEAR or BLOCKED every 30 seconds. BNSF doesn't publish live positions — this is best-effort supplemental data.",
  },
  {
    number: "05",
    tag: "Community layer",
    title: "Community Reports",
    body: "Anyone can report a blocked crossing. Reports include crossing, time, railroad, and duration. They surface on the map immediately and notify dispatch.",
  },
];

const faqs = [
  {
    q: "Does ClearPath work for freight trains?",
    a: "Limited. We use camera AI on a public railcam, not real-time BNSF data. BNSF does not publish live positions. Treat freight status as supplemental — never authoritative.",
  },
  {
    q: "How accurate are the ETAs?",
    a: "Within a few minutes for Amtrak trains. ETAs assume constant speed — actual arrival varies based on signal holds, grade, and crew rest. Use for staging decisions, not precision timing.",
  },
  {
    q: "Is ClearPath official?",
    a: "No. ClearPath is an independent, open-source, community project. Always follow official dispatch protocols. This tool is situational awareness — not a replacement for dispatch communication.",
  },
];

export default function HowItWorksPage() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--text)" }}>
      <style>{`
        .hiw-hero {
          background: #0f172a;
          color: #fff;
          padding: 3.5rem 1.5rem 3rem;
          text-align: center;
        }
        .hiw-hero h1 {
          font-size: clamp(1.625rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.875rem;
        }
        .hiw-hero p {
          font-size: 1.0625rem;
          color: #94a3b8;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .hiw-content {
          max-width: 780px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .section-heading {
          font-size: 1.375rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        /* Steps */
        .steps-list {
          list-style: none;
          padding: 0;
          margin: 0 0 3.5rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .step-item {
          display: flex;
          gap: 0;
          align-items: stretch;
        }
        .step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 56px;
        }
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0f172a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .step-line {
          width: 2px;
          flex: 1;
          background: var(--border);
          margin: 4px 0;
        }
        .step-item:last-child .step-line {
          display: none;
        }
        .step-body {
          padding: 0 0 2.5rem 1rem;
          flex: 1;
        }
        .step-tag {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--blue);
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          padding: 0.15rem 0.5rem;
          margin-bottom: 0.375rem;
        }
        .step-title {
          font-size: 1.0625rem;
          font-weight: 700;
          margin-bottom: 0.375rem;
          color: var(--text);
        }
        .step-desc {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin: 0;
        }
        /* Freight gap */
        .freight-gap {
          background: var(--blocked-light);
          border: 1px solid var(--blocked-border);
          border-radius: var(--radius);
          padding: 1.75rem;
          margin-bottom: 3rem;
        }
        .freight-gap h2 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #7f1d1d;
        }
        .freight-gap p {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #7f1d1d;
          margin-bottom: 0.75rem;
        }
        .freight-gap p:last-child { margin-bottom: 0; }
        .disclaimer-banner {
          background: #fef2f2;
          border: 2px solid var(--blocked);
          border-radius: var(--radius);
          padding: 0.875rem 1.25rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--blocked);
          margin-top: 0.75rem;
        }
        /* Data freshness table */
        .freshness-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 3rem;
          background: var(--surface);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .freshness-table th {
          background: #f8fafc;
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        .freshness-table td {
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .freshness-table tr:last-child td { border-bottom: none; }
        .freshness-table td:first-child { font-weight: 600; }
        .freshness-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          background: var(--clear-light);
          color: var(--clear);
          border: 1px solid var(--clear-border);
        }
        /* Tech stack */
        .tech-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }
        .tech-pill {
          font-size: 0.8125rem;
          font-weight: 600;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 0.3rem 0.875rem;
          color: var(--text-muted);
        }
        /* FAQ */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 1.25rem 1.5rem;
        }
        .faq-item dt {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .faq-item dd {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin: 0;
        }
        @media (max-width: 600px) {
          .step-left { width: 40px; }
          .step-circle { width: 32px; height: 32px; font-size: 0.6875rem; }
        }
      `}</style>

      {/* Hero */}
      <section className="hiw-hero">
        <h1>How ClearPath Works</h1>
        <p>
          Real-time train tracking, camera-based freight detection, and community
          reporting — all in one place.
        </p>
      </section>

      <div className="hiw-content">

        {/* Data flow steps */}
        <div className="section-label">Data flow</div>
        <h2 className="section-heading">From Train to Alert in 5 Steps</h2>
        <ol className="steps-list">
          {steps.map((step) => (
            <li key={step.number} className="step-item">
              <div className="step-left">
                <div className="step-circle">{step.number}</div>
                <div className="step-line" />
              </div>
              <div className="step-body">
                <div className="step-tag">{step.tag}</div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Freight gap */}
        <section className="freight-gap">
          <h2>The Freight Data Gap</h2>
          <p>
            BNSF does not publish live train positions. Their data is proprietary
            and there is no federal mandate to share it. Unlike Amtrak — which
            exposes real-time GPS through its public API — freight railroads
            operate as a black box.
          </p>
          <p>
            ClearPath bridges that gap with computer vision: a YOLO model watches
            the public Steel Highway railcam and writes a CLEAR or BLOCKED
            status every 30 seconds.
          </p>
          <div className="disclaimer-banner">
            ⚠ Camera detection is best-effort — NOT authoritative dispatch data.
            Always use official protocols when lives are at stake.
          </div>
        </section>

        {/* Data freshness */}
        <h2 className="section-heading">Data Freshness</h2>
        <table className="freshness-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Update interval</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Amtrak positions</td>
              <td>Every 30–60 seconds</td>
              <td><span className="freshness-badge">Live</span></td>
            </tr>
            <tr>
              <td>Freight camera (YOLO)</td>
              <td>Every 30 seconds</td>
              <td><span className="freshness-badge">Live</span></td>
            </tr>
            <tr>
              <td>Community reports</td>
              <td>Real-time on submit</td>
              <td><span className="freshness-badge">Live</span></td>
            </tr>
          </tbody>
        </table>

        {/* Tech stack */}
        <div className="section-label">Built with</div>
        <h2 className="section-heading">The Stack</h2>
        <div className="tech-row">
          {["Next.js 14", "TypeScript", "Python", "YOLO", "MySQL", "amtraker.com API", "Vercel"].map((t) => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="section-heading">Common Questions</h2>
        <dl className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.q} className="faq-item">
              <dt>{faq.q}</dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>

      </div>
    </main>
  );
}
