'use client'

import { useState, useEffect, FormEvent } from 'react'

const CROSSINGS = [
  'IL-51 (Illinois Route 51)',
  'Main St',
  'Sixth Ave',
  'Washington St / IL-251',
  'Other / Not Listed',
]

const RAILROADS = ['BNSF', 'Union Pacific', 'Amtrak', 'Other']

interface Report {
  id: string
  crossing: string
  railroad: string
  reported_at: string
  duration_minutes: number | null
  description: string
  reporter_name: string
  submitted_at: string
}

function nowLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function ReportPage() {
  const [crossing, setCrossing] = useState(CROSSINGS[0])
  const [railroad, setRailroad] = useState(RAILROADS[0])
  const [reportedAt, setReportedAt] = useState(nowLocal)
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const res = await fetch('/api/report')
      if (res.ok) setReports(await res.json())
    } catch {
      // non-fatal
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crossing,
          railroad,
          reported_at: new Date(reportedAt).toISOString(),
          duration_minutes: duration ? parseInt(duration, 10) : null,
          description,
          reporter_name: reporterName,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Submission failed')
      }
      const report: Report = await res.json()
      setSubmitted(report)
      fetchReports()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  function buildEmailBody(report: Report): string {
    return encodeURIComponent(
      `A grade crossing blockage has been reported via ClearPath.\n\n` +
        `Crossing: ${report.crossing}\n` +
        `Railroad: ${report.railroad}\n` +
        `When blocked: ${formatDateTime(report.reported_at)}\n` +
        `Duration: ${report.duration_minutes != null ? `${report.duration_minutes} minutes` : 'Unknown'}\n` +
        `Details: ${report.description || 'None provided'}\n` +
        `Reporter: ${report.reporter_name || 'Anonymous'}\n\n` +
        `Submitted via ClearPath (https://clearpath.champlinenterprises.com)`
    )
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        Report a Blocked Crossing
      </h1>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        Help first responders and neighbors by logging a blocked grade crossing.
      </p>

      {submitted ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', borderRadius: 8, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#15803d', marginTop: 0 }}>Report submitted — thank you.</h2>
          <p style={{ margin: '0 0 1rem' }}>
            Your report for <strong>{submitted.crossing}</strong> has been recorded.
          </p>
          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
            <li>
              <strong>Train still blocking?</strong>{' '}
              <a href="tel:18008325452" style={{ color: '#15803d' }}>
                BNSF Emergency Line: 1-800-832-5452
              </a>
            </li>
            <li>
              <strong>File a formal complaint:</strong>{' '}
              <a href="tel:18004240201" style={{ color: '#15803d' }}>
                FRA Safety Hotline: 1-800-424-0201
              </a>
            </li>
            <li>
              <a
                href={`mailto:citymanager@cityofmendota.com,mayor@cityofmendota.com?subject=${encodeURIComponent(`Grade Crossing Blockage — ${submitted.crossing}`)}&body=${buildEmailBody(submitted)}`}
                style={{ color: '#15803d' }}
              >
                Email this report to Mendota city officials
              </a>
            </li>
          </ul>
          <button
            onClick={() => setSubmitted(null)}
            style={{ background: '#15803d', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.25rem', cursor: 'pointer' }}
          >
            Report another crossing
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Crossing <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={crossing}
              onChange={e => setCrossing(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem' }}
            >
              {CROSSINGS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Railroad <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={railroad}
              onChange={e => setRailroad(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem' }}
            >
              {RAILROADS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              When blocked <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={reportedAt}
              onChange={e => setReportedAt(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Duration blocked (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={480}
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 45"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Any details that might help responders"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Your name
            </label>
            <input
              type="text"
              value={reporterName}
              onChange={e => setReporterName(e.target.value)}
              placeholder="Anonymous OK"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem' }}
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#9ca3af' : '#1e40af',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </form>
      )}

      {reports.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            Recent Reports
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.slice(0, 10).map(r => (
              <div
                key={r.id}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', background: '#f9fafb' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1rem' }}>{r.crossing}</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {r.railroad}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                  Blocked at: {formatDateTime(r.reported_at)}
                  {r.duration_minutes != null && ` · ${r.duration_minutes} min`}
                </div>
                {r.description && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
                    {r.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
        <p style={{ margin: 0 }}>
          Emergency contacts —{' '}
          <strong>Train still blocking?</strong>{' '}
          <a href="tel:18008325452">BNSF Emergency Line: 1-800-832-5452</a>
          {' · '}
          <a href="tel:18004240201">FRA Safety Hotline: 1-800-424-0201</a>
        </p>
      </div>
    </main>
  )
}
