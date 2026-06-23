// Server Component — no JS required in the browser (except the print button).
import type { Metadata } from "next";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Mendota Grade Crossing Reference — ClearPath",
  description: "Printable reference card for Mendota, IL grade crossings and emergency contacts.",
};

// Static crossing data — mirrors config/town.ts so this page works offline.
const CROSSINGS = [
  {
    id: "077482T",
    name: "Illinois Rte 51 / Meriden-Mendota Rd",
    street: "IL-51",
    lat: 41.5497,
    lng: -89.1178,
  },
  {
    id: "077483Z",
    name: "Main St",
    street: "Main St",
    lat: 41.5511,
    lng: -89.122,
  },
  {
    id: "077484F",
    name: "Sixth Ave",
    street: "Sixth Ave",
    lat: 41.5518,
    lng: -89.1255,
  },
  {
    id: "077485L",
    name: "Washington St / IL-251",
    street: "IL-251",
    lat: 41.5526,
    lng: -89.1298,
  },
] as const;

const EMERGENCY_CONTACTS = [
  { label: "Mendota Fire Department", number: "815-539-7277" },
  { label: "BNSF Railway Emergency Line", number: "1-800-832-5452" },
  { label: "FRA Safety Hotline", number: "1-800-424-0201" },
] as const;

const TODAY = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function PrintPage() {
  return (
    <>
      {/* Inline styles keep this page dependency-free for offline printing */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: system-ui, -apple-system, Arial, sans-serif;
          background: #fff;
          color: #111;
          font-size: 14px;
        }

        .page-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 2rem 1.5rem 3rem;
        }

        /* ── Page header ─────────────────────────── */
        .page-header {
          border-bottom: 3px solid #1d4ed8;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .page-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e293b;
        }

        .page-title span { color: #1d4ed8; }

        .page-date {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* ── Print button ────────────────────────── */
        .print-btn-wrap {
          margin-bottom: 1.75rem;
        }

        .print-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1d4ed8;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 6px;
          padding: 0.65rem 1.4rem;
          cursor: pointer;
          text-decoration: none;
        }

        .print-btn:hover { background: #1e40af; }

        /* ── Section heading ─────────────────────── */
        .section-heading {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.3rem;
          margin: 1.75rem 0 0.9rem;
        }

        /* ── Crossing table ──────────────────────── */
        .crossing-table {
          width: 100%;
          border-collapse: collapse;
        }

        .crossing-table th {
          background: #f1f5f9;
          text-align: left;
          padding: 0.5rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .crossing-table td {
          padding: 0.6rem 0.75rem;
          border: 1px solid #e2e8f0;
          vertical-align: top;
          font-size: 0.92rem;
          color: #1e293b;
        }

        .crossing-table tr:nth-child(even) td { background: #f8fafc; }

        .crossing-name-cell { font-weight: 600; }

        .fra-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-family: monospace;
          background: #e2e8f0;
          border-radius: 3px;
          padding: 0.1rem 0.35rem;
          color: #475569;
        }

        .coords { font-family: monospace; font-size: 0.82rem; color: #64748b; }

        /* ── Alternative routes box ──────────────── */
        .alt-routes-box {
          background: #fffbeb;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-top: 0.9rem;
        }

        .alt-routes-box h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #92400e;
          margin-bottom: 0.4rem;
        }

        .alt-routes-box p {
          font-size: 0.88rem;
          color: #78350f;
          line-height: 1.5;
        }

        .clearance-tag {
          display: inline-block;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 4px;
          padding: 0.05rem 0.4rem;
          font-weight: 700;
          font-size: 0.85rem;
        }

        /* ── Emergency contacts ──────────────────── */
        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.6rem 0.9rem;
        }

        .contact-label {
          flex: 1;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.92rem;
        }

        .contact-number {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1d4ed8;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        /* ── Footer note ─────────────────────────── */
        .print-note {
          margin-top: 2.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.78rem;
          color: #94a3b8;
          text-align: center;
        }

        /* ── Back link (screen only) ─────────────── */
        .back-link {
          display: inline-block;
          margin-top: 1.5rem;
          color: #1d4ed8;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .back-link:hover { text-decoration: underline; }

        /* ── Print media ─────────────────────────── */
        @media print {
          .no-print { display: none !important; }

          body { font-size: 12px; }

          .page-wrap { padding: 0; max-width: 100%; }

          .page-header { border-bottom-color: #000; }

          .contact-number { color: #000; }

          .alt-routes-box { border-color: #000; background: #fff; }

          .crossing-table th { background: #e5e7eb; }

          a { color: inherit; text-decoration: none; }

          /* Ensure table doesn't break across pages */
          .crossing-table { page-break-inside: avoid; }
        }
      `}</style>

      <div className="page-wrap">
        {/* Page header */}
        <header className="page-header">
          <h1 className="page-title">
            <span>ClearPath</span> — Mendota Grade Crossing Reference
          </h1>
          <span className="page-date">Printed: {TODAY}</span>
        </header>

        {/* Print button (hidden when printing) */}
        <div className="print-btn-wrap no-print">
          <PrintButton className="print-btn">
            🖨 PRINT THIS PAGE
          </PrintButton>
        </div>

        {/* Grade Crossings table */}
        <h2 className="section-heading">Grade Crossings — Mendota, IL</h2>
        <table className="crossing-table">
          <thead>
            <tr>
              <th>Crossing Name</th>
              <th>FRA ID</th>
              <th>Street</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {CROSSINGS.map((c) => (
              <tr key={c.id}>
                <td className="crossing-name-cell">{c.name}</td>
                <td>
                  <span className="fra-badge">{c.id}</span>
                </td>
                <td>{c.street}</td>
                <td>
                  <span className="coords">
                    {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Alternative routes */}
        <h2 className="section-heading">Alternative Routes &amp; Clearances</h2>
        <div className="alt-routes-box">
          <h3>⚠ Fourth Avenue Viaduct</h3>
          <p>
            Vertical clearance: <span className="clearance-tag">13&apos;2&quot;</span>. This
            underpass is <strong>NOT suitable</strong> for ladder trucks, aerial
            apparatus, or heavy emergency vehicles. Route around via Washington St
            (IL-251) or IL-51 when any crossing on the BNSF mainline is blocked.
            Use IL-251 (Washington St crossing, FRA&nbsp;077485L) as primary bypass for
            westbound apparatus.
          </p>
        </div>

        {/* Emergency contacts */}
        <h2 className="section-heading">Emergency Contacts</h2>
        <div className="contacts-list">
          {EMERGENCY_CONTACTS.map((contact) => (
            <div key={contact.number} className="contact-row">
              <span className="contact-label">{contact.label}</span>
              <span className="contact-number">{contact.number}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="print-note">
          ClearPath — Mendota Grade Crossing Reference &nbsp;|&nbsp; Generated {TODAY} &nbsp;|&nbsp;
          Live data at champlinenterprises.com/clearpath
        </p>

        {/* Back link (screen only) */}
        <a href="/dispatch" className="back-link no-print">
          ← Back to Dispatch View
        </a>
      </div>
    </>
  );
}
