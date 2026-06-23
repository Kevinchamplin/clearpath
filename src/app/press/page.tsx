export default function PressPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.875rem', color: '#475569' }}>
        Press kit for journalists and city officials. Updated June 23, 2026.
      </div>

      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        ClearPath — Press Kit
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          About ClearPath
        </h2>
        <p>
          ClearPath is a free, open-source real-time train position monitor built for communities
          living along busy freight rail corridors. It tracks Amtrak trains approaching grade crossings,
          gives dispatchers and first responders a 10–20 minute heads-up, and lets residents report
          freight train blockages that aren&apos;t visible in any public data feed.
        </p>
        <p>
          ClearPath was built for Mendota, Illinois, and is designed to be forked and deployed by
          any town in five minutes, free of charge.
        </p>
        <p>
          Live at:{' '}
          <a href="https://clearpath.champlinenterprises.com" style={{ color: '#1e40af' }}>
            clearpath.champlinenterprises.com
          </a>
          {' · '}
          Source:{' '}
          <a href="https://github.com/Kevinchamplin/clearpath" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>
            github.com/Kevinchamplin/clearpath
          </a>
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          The Problem
        </h2>
        <p>
          Long trains blocking grade crossings delay fire trucks, ambulances, and police in small
          towns across the Illinois Valley. When a 150-car freight train stops across Main Street,
          first responders have no automated way to know it&apos;s there — and no way to predict
          how long it will stay.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Source: LaSalle NewsTribune, June 23, 2026 — coverage of blocked crossings in Mendota and
          surrounding Illinois Valley communities.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Key Facts (from the June 23, 2026 Article)
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <strong>4 hours</strong> — documented duration of a single crossing blockage in Mendota
          </li>
          <li>
            <strong>25% longer trains</strong> — freight trains on the corridor are significantly
            longer than a decade ago, blocking more crossings simultaneously for more time
          </li>
          <li>
            <strong>Fire doubles every minute</strong> — the industry standard for fire spread rate,
            illustrating why delayed first-responder access has life-or-death consequences
          </li>
          <li>
            <strong>No public freight data</strong> — BNSF and Union Pacific do not publish real-time
            train positions; community reporting is currently the only way to log blockages
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Officials on Record
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { name: 'Shane Rutishauser', title: 'City Manager, Mendota IL', note: 'Working with ClearPath on crossing visibility' },
            { name: 'Matt Booras', title: 'Fire Chief, Mendota IL', note: 'Documented cases of delayed emergency response' },
            { name: 'Brian Bressner', title: 'Fire Chief, Ottawa IL', note: 'On record regarding corridor blockage impact' },
            { name: 'Scott Etheridge', title: 'Fire Chief, Princeton IL', note: 'On record regarding corridor blockage impact' },
            { name: 'Robert Wood', title: 'Police Chief, Streator IL', note: 'On record regarding corridor blockage impact' },
          ].map(({ name, title, note }) => (
            <div key={name} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.875rem', background: '#f9fafb' }}>
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>{title}</div>
              {note && <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>{note}</div>}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          What ClearPath Does
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Tracks real-time Amtrak train positions via the public Amtrak map API</li>
          <li>Calculates ETA to each grade crossing for every nearby train</li>
          <li>Alerts dispatchers and first responders when a train is within 20 minutes of any crossing</li>
          <li>Provides a community blockage report form for logging freight train blockages</li>
          <li>Includes a first-responder dispatch view optimized for tablets (15-second auto-refresh)</li>
          <li>Is open-source and forkable — any town can deploy their own instance in minutes</li>
          <li>Runs on Vercel free tier — zero ongoing cost for municipalities</li>
        </ul>
        <p>
          <strong>Technical note:</strong> Freight train positions (BNSF, Union Pacific) are not
          publicly available. ClearPath fills this gap with community reporting while providing
          automated tracking for all Amtrak services.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
          Contact / Attribution
        </h2>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1.5rem' }}>
          <dt style={{ fontWeight: 600, color: '#374151' }}>Built by</dt>
          <dd style={{ margin: 0 }}>Kevin Champlin, Mendota IL</dd>
          <dt style={{ fontWeight: 600, color: '#374151' }}>Email</dt>
          <dd style={{ margin: 0 }}>
            <a href="mailto:kevin@kevinchamplin.com" style={{ color: '#1e40af' }}>kevin@kevinchamplin.com</a>
          </dd>
          <dt style={{ fontWeight: 600, color: '#374151' }}>GitHub</dt>
          <dd style={{ margin: 0 }}>
            <a href="https://github.com/Kevinchamplin/clearpath" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>
              github.com/Kevinchamplin/clearpath
            </a>
          </dd>
          <dt style={{ fontWeight: 600, color: '#374151' }}>Live site</dt>
          <dd style={{ margin: 0 }}>
            <a href="https://clearpath.champlinenterprises.com" style={{ color: '#1e40af' }}>
              clearpath.champlinenterprises.com
            </a>
          </dd>
          <dt style={{ fontWeight: 600, color: '#374151' }}>License</dt>
          <dd style={{ margin: 0 }}>MIT — free to use, fork, and deploy</dd>
        </dl>
      </section>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
        <p style={{ margin: 0 }}>
          <a href="/" style={{ color: '#1e40af' }}>← Live dashboard</a>
          {' · '}
          <a href="/corridor" style={{ color: '#1e40af' }}>Illinois Valley corridor</a>
          {' · '}
          <a href="/report" style={{ color: '#1e40af' }}>Report a blockage</a>
        </p>
      </div>
    </main>
  )
}
