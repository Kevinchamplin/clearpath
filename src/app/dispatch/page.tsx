"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./dispatch.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

interface Train {
  trainNumber: string;
  trainName: string;
  speed: number;
  delayMinutes: number;
  crossings: CrossingEta[];
}

interface Crossing {
  id: string;
  name: string;
  lat: number;
  lng: number;
  street: string;
}

interface ApiResponse {
  trains: Train[];
  crossings: Crossing[];
  fetchedAt: string;
  error?: string;
}

interface CrossingAlert {
  trainNumber: string;
  trainName: string;
  etaMinutes: number;
  distanceMiles: number;
  speed: number;
  delayMinutes: number;
}

interface CrossingView {
  id: string;
  name: string;
  alerts: CrossingAlert[];   // only approaching trains
  hasAlert: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCrossingViews(trains: Train[], crossings: Crossing[]): CrossingView[] {
  return crossings.map((crossing) => {
    const alerts: CrossingAlert[] = [];

    for (const train of trains) {
      const c = train.crossings.find((cx) => cx.crossingId === crossing.id);
      if (!c || !c.approaching || c.etaMinutes === null) continue;
      alerts.push({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        etaMinutes: c.etaMinutes,
        distanceMiles: c.distanceMiles,
        speed: train.speed,
        delayMinutes: train.delayMinutes,
      });
    }

    alerts.sort((a, b) => a.etaMinutes - b.etaMinutes);

    return {
      id: crossing.id,
      name: crossing.name,
      alerts,
      hasAlert: alerts.length > 0,
    };
  });
}

// Community reports are simulated in this sprint; replace with real API when available.
type CommunityReport = { crossingId: string; minutesAgo: number; type: string };
const DUMMY_REPORTS: CommunityReport[] = [];

function communityReportFor(crossingId: string): CommunityReport | undefined {
  return DUMMY_REPORTS.find(
    (r) => r.crossingId === crossingId && r.minutesAgo <= 120
  );
}

// ─── Clock component ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className={styles.clock}>{time}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/trains", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
      setLastRefresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const id = setInterval(fetchData, 15_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const crossingViews: CrossingView[] = data
    ? buildCrossingViews(data.trains, data.crossings)
    : [];

  const anyAlerting = crossingViews.some((c) => c.hasAlert);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          <span>ClearPath</span> Dispatch — Mendota, IL
        </h1>
        <LiveClock />
        {lastRefresh && (
          <span className={styles.refreshBadge}>Refreshed {lastRefresh}</span>
        )}
      </header>

      {/* Fourth Ave Viaduct warning — shown whenever any crossing is alerting */}
      {anyAlerting && (
        <div className={styles.viaductBanner}>
          <span className={styles.viaductIcon}>⚠️</span>
          <span>
            <strong>Fourth Ave Viaduct — 13&apos;2&quot; clearance</strong> — NOT suitable for
            ladder trucks or heavy apparatus. Use alternate routing.
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>
          Train data unavailable: {error}. Retrying every 15 seconds.
        </div>
      )}

      {/* Crossing cards */}
      {!data && !error && (
        <p className={styles.loadingText}>Loading crossing data…</p>
      )}

      {data && (
        <div className={styles.grid}>
          {crossingViews.map((crossing) => {
            const report = communityReportFor(crossing.id);
            const topAlert = crossing.alerts[0];

            return (
              <div
                key={crossing.id}
                className={`${styles.card} ${
                  crossing.hasAlert ? styles.cardAlert : styles.cardClear
                }`}
              >
                <div className={styles.crossingName}>{crossing.name}</div>

                {/* Status badge */}
                <div
                  className={`${styles.statusBadge} ${
                    crossing.hasAlert ? styles.statusAlert : styles.statusClear
                  }`}
                >
                  {crossing.hasAlert
                    ? `⚠ TRAIN IN ${topAlert.etaMinutes} MIN`
                    : "✓ CLEAR"}
                </div>

                {/* Train detail — shown when approaching */}
                {crossing.hasAlert && topAlert && (
                  <div className={styles.trainDetail}>
                    <span className={styles.trainDetailLabel}>Train</span>
                    <span className={styles.trainDetailValue}>
                      #{topAlert.trainNumber} {topAlert.trainName}
                    </span>
                    <span className={styles.trainDetailLabel}>Speed / Delay</span>
                    <span className={styles.trainDetailValue}>
                      {topAlert.speed} mph
                      {topAlert.delayMinutes > 0
                        ? ` — ${topAlert.delayMinutes} min late`
                        : " — On time"}
                    </span>
                  </div>
                )}

                {/* Community report */}
                {report && (
                  <div className={styles.communityReport}>
                    📣 Community report: {report.type} blocked {report.minutesAgo} min ago
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLink}>
          ← Back to Map
        </Link>
        <Link href="/print" className={styles.footerLink}>
          Print Crossing Map
        </Link>
      </footer>
    </div>
  );
}
