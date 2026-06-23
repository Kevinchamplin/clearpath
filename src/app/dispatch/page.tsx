"use client";

import { useEffect, useState, useRef } from "react";
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
  alerts: CrossingAlert[];
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className={styles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonStatus}`} />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [cleared, setCleared] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Add dispatch-mode class to body (hides site header + bottom nav)
  useEffect(() => {
    document.body.classList.add("dispatch-mode");
    return () => {
      document.body.classList.remove("dispatch-mode");
    };
  }, []);

  const fallbackFetch = async () => {
    try {
      const res = await fetch("/api/trains", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const connect = () => {
    if (esRef.current) {
      esRef.current.close();
    }
    const es = new EventSource("/api/trains/stream");
    esRef.current = es;

    es.onmessage = (evt) => {
      try {
        const json: ApiResponse = JSON.parse(evt.data);
        if (!json.error) {
          setData(json);
          setError(null);
          setLastRefresh(new Date());
        }
      } catch {
        // malformed SSE frame — ignore
      }
    };

    es.onerror = () => {
      es.close();
      fallbackFetch();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crossingViews: CrossingView[] = data
    ? buildCrossingViews(data.trains, data.crossings)
    : [];

  const anyAlerting = !cleared && crossingViews.some((c) => c.hasAlert);

  const lastRefreshStr = lastRefresh
    ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          <span>ClearPath</span> Dispatch — Mendota, IL
        </h1>
        <LiveClock />
        {lastRefreshStr && (
          <span className={styles.refreshBadge}>Updated {lastRefreshStr}</span>
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
          Train data unavailable: {error}. Retrying…
        </div>
      )}

      {/* Loading skeleton */}
      {!data && !error && <LoadingSkeleton />}

      {/* Crossing cards */}
      {data && (
        <div className={styles.grid}>
          {crossingViews.map((crossing) => {
            const topAlert = crossing.alerts[0];
            const hasAlert = !cleared && crossing.hasAlert;

            return (
              <div
                key={crossing.id}
                className={`${styles.card} ${
                  hasAlert ? styles.cardAlert : styles.cardClear
                }`}
              >
                <div className={styles.crossingName}>{crossing.name}</div>

                {/* Status badge */}
                <div
                  className={`${styles.statusBadge} ${
                    hasAlert ? styles.statusAlert : styles.statusClear
                  }`}
                >
                  {hasAlert
                    ? `⚠ TRAIN IN ${topAlert.etaMinutes} MIN`
                    : "✓ ALL CLEAR"}
                </div>

                {/* Train detail — shown when approaching */}
                {hasAlert && topAlert && (
                  <div className={styles.trainDetail}>
                    <span className={styles.trainDetailLabel}>Train</span>
                    <span className={styles.trainDetailValue}>
                      #{topAlert.trainNumber} {topAlert.trainName}
                    </span>
                    <span className={styles.trainDetailLabel}>Speed / Status</span>
                    <span className={styles.trainDetailValue}>
                      {topAlert.speed} mph
                      {topAlert.delayMinutes > 0
                        ? ` — ${topAlert.delayMinutes} min late`
                        : " — On time"}
                    </span>
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
        {anyAlerting && (
          <button
            className={styles.footerLink}
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setCleared(true)}
          >
            ✕ Clear Alerts
          </button>
        )}
        {cleared && (
          <button
            className={styles.footerLink}
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setCleared(false)}
          >
            ↺ Restore Alerts
          </button>
        )}
      </footer>
    </div>
  );
}
