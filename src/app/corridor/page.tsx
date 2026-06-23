export default function CorridorPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        The Illinois Valley Rail Corridor
      </h1>
      <p style={{ color: '#4b5563', fontSize: '1.125rem', marginBottom: '2rem' }}>
        The UP and BNSF mainlines run through one of the most freight-dense corridors in North America.
        Trains up to 150 cars long — 25% longer than a decade ago — cross dozens of at-grade intersections
        every day, blocking emergency access in communities from Streator to Mendota.
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem' }}>
          Towns in the Corridor
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              town: 'Mendota',
              note: 'Using ClearPath',
              link: '/',
              officials: 'City Manager Shane Rutishauser; Fire Chief Matt Booras',
            },
            {
              town: 'Ottawa',
              note: null,
              link: null,
              officials: 'Fire Chief Brian Bressner on record',
            },
            {
              town: 'Princeton',
              note: null,
              link: null,
              officials: 'Fire Chief Scott Etheridge on record',
            },
            {
              town: 'Streator',
              note: null,
              link: null,
              officials: 'Police Chief Robert Wood on record',
            },
            {
              town: 'La Salle',
              note: 'Part of the Illinois Valley',
              link: null,
              officials: null,
            },
          ].map(({ town, note, link, officials }) => (
            <div
              key={town}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', background: '#f9fafb' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1.0625rem' }}>
                  {link ? <a href={link} style={{ color: '#1e40af', textDecoration: 'none' }}>{town}</a> : town}
                </strong>
                {note && (
                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                    {note}
                  </span>
                )}
              </div>
              {officials && (
                <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {officials}
                </p>
              )}
            </div>
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Source: LaSalle NewsTribune, June 23, 2026.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
          Fork ClearPath for Your Town
        </h2>
        <p style={{ margin: '0 0 1rem' }}>
          ClearPath is open-source and designed to be forked. You can have a live crossing monitor
          for your town in under 30 minutes, for free.
        </p>
        <ol style={{ margin: '0 0 1rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>Clone the repo</strong>
            <br />
            <code style={{ background: '#dbeafe', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.9rem' }}>
              git clone https://github.com/Kevinchamplin/clearpath
            </code>
          </li>
          <li>
            <strong>Edit <code>src/config/town.ts</code></strong>
            <br />
            Set your town name, center lat/lng, and zoom level. Add your grade crossings using
            FRA IDs from the{' '}
            <a href="https://railroads.dot.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>
              FRA crossing inventory
            </a>
            . Set <code>watchTrains</code> to the Amtrak train numbers that run through your town.
          </li>
          <li>
            <strong>Deploy to Vercel</strong>
            <br />
            Push to GitHub, import the repo in{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>
              vercel.com
            </a>
            , and deploy. Free tier — no credit card required.
          </li>
          <li>
            <strong>Share with your fire department and dispatch</strong>
            <br />
            Send the URL. Works on any phone, tablet, or computer.
          </li>
        </ol>
        <a
          href="https://github.com/Kevinchamplin/clearpath"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', background: '#1e40af', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: 6, fontWeight: 600, textDecoration: 'none' }}
        >
          View on GitHub →
        </a>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem' }}>
          The Data Gap
        </h2>
        <p>
          Unlike Amtrak — which publishes real-time GPS positions through its public map API —
          freight railroads (BNSF, Union Pacific, CSX, NS) do not make train positions publicly
          available. Their data is proprietary, and there is no federal mandate to share it.
        </p>
        <p>
          That means ClearPath can track the California Zephyr, the Empire Builder, the Illinois
          Service, and other Amtrak trains — but not the hundred-car freight trains that cause the
          longest blockages. A 150-car BNSF manifest train can sit across every crossing in Mendota
          for 45 minutes, and no public data source will tell you it&apos;s there.
        </p>
        <p>
          This is why community reporting matters. The{' '}
          <a href="/report" style={{ color: '#1e40af' }}>blockage report form</a>{' '}
          lets residents, firefighters, and dispatchers log actual freight blockages in real time.
          That data doesn&apos;t replace automated tracking — but it fills the gap until the railroads
          or the FRA provide public access.
        </p>
        <p>
          Until then: if you see a crossing blocked, report it. It could save a life.
        </p>
      </section>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
        <p style={{ margin: 0 }}>
          <a href="/" style={{ color: '#1e40af' }}>← Back to live dashboard</a>
          {' · '}
          <a href="/report" style={{ color: '#1e40af' }}>Report a blocked crossing</a>
          {' · '}
          <a href="/press" style={{ color: '#1e40af' }}>Press kit</a>
        </p>
      </div>
    </main>
  )
}
