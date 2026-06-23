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

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '16px',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  background: '#fff',
  color: '#0f172a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.9375rem',
  marginBottom: '6px',
  color: '#0f172a',
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
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--text)', paddingBottom: '4rem' }}>
      <style>{`
        .report-input:focus {
          border-color: #1d4ed8 !important;
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.15);
        }
        @media (max-width: 600px) {
          .report-inner { padding: 1rem !important; }
          .report-card { padding: 1.25rem !important; }
        }
      `}</style>

      {/* Emergency bar */}
      <div style={{
        background: '#dc2626',
        color: '#fff',
        padding: '0.875rem 1.5rem',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: 700,
        lineHeight: 1.5,
      }}>
        🚨 Train still blocking?{' '}
        <a href="tel:18008325452" style={{ color: '#fff', textDecoration: 'underline' }}>
          Call BNSF Emergency: 1-800-832-5452
        </a>
      </div>

      <div className="report-inner" style={{ maxWidth: 640, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {submitted ? (
          /* Success state */
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #15803d',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#15803d', margin: '0 0 0.5rem' }}>
              Report submitted. Thank you.
            </h2>
            <p style={{ color: '#166534', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Your report for <strong>{submitted.crossing}</strong> is live on the map.
            </p>
            <div style={{
              background: '#fff',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.9375rem',
              lineHeight: 2,
            }}>
              <div>
                <strong>Train still blocking?</strong>{' '}
                <a href="tel:18008325452" style={{ color: '#15803d' }}>BNSF Emergency: 1-800-832-5452</a>
              </div>
              <div>
                <strong>File a complaint:</strong>{' '}
                <a href="tel:18004240201" style={{ color: '#15803d' }}>FRA Safety Hotline: 1-800-424-0201</a>
              </div>
              <div>
                <a
                  href={`mailto:citymanager@cityofmendota.com,mayor@cityofmendota.com?subject=${encodeURIComponent(`Grade Crossing Blockage — ${submitted.crossing}`)}&body=${buildEmailBody(submitted)}`}
                  style={{ color: '#15803d' }}
                >
                  Email report to Mendota city officials →
                </a>
              </div>
            </div>
            <button
              onClick={() => setSubmitted(null)}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          /* Form */
          <article className="report-card" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>
              Report a Blocked Crossing
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Help first responders and neighbors. Reports appear on the map immediately.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div>
                <label style={labelStyle}>
                  Crossing <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="report-input"
                  value={crossing}
                  onChange={e => setCrossing(e.target.value)}
                  required
                  style={inputStyle}
                >
                  {CROSSINGS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  When blocked <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  className="report-input"
                  type="datetime-local"
                  value={reportedAt}
                  onChange={e => setReportedAt(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Duration blocked (minutes)
                </label>
                <input
                  className="report-input"
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 45"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Railroad <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="report-input"
                  value={railroad}
                  onChange={e => setRailroad(e.target.value)}
                  required
                  style={inputStyle}
                >
                  {RAILROADS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>(optional)</span>
                </label>
                <textarea
                  className="report-input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Any details that might help responders — car count, direction, if it's moving…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Your name <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>(optional — anonymous OK)</span>
                </label>
                <input
                  className="report-input"
                  type="text"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Anonymous"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem',
                  color: '#dc2626',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#94a3b8' : '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0',
                  height: '52px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  width: '100%',
                  transition: 'background 0.15s',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </form>
          </article>
        )}

        {/* Recent reports */}
        {reports.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
              Recent Reports
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reports.slice(0, 5).map(r => (
                <div
                  key={r.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--blocked)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.crossing}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.railroad} · {r.duration_minutes != null ? `${r.duration_minutes} min` : 'duration unknown'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {timeAgo(r.submitted_at || r.reported_at)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
