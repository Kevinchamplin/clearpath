"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import CrossingStatus from "@/components/CrossingStatus";
import config from "@/config/town";

interface CommunityReport {
  crossingId: string;
  reported_at: string;
  duration_minutes: number;
}

interface FreightStatusRecord {
  crossing_id: string;
  state: "CLEAR" | "BLOCKED" | "UNKNOWN";
  confidence: number;
  blocked_since: string | null;
  updated_at: string;
}

// Leaflet must not SSR
const TrainMap = dynamic(() => import("@/components/TrainMap"), { ssr: false });

interface ApiResponse {
  trains: TrainData[];
  crossings: typeof config.crossings;
  town: { name: string; state: string };
  fetchedAt: string;
  error?: string;
}

interface TrainData {
  trainNumber: string;
  trainName: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
  lastUpdated: string;
  originCode: string;
  destCode: string;
  delayMinutes: number;
  statusMsg: string;
  crossings: CrossingEta[];
  nextStation?: { name: string; schArr: string };
}

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [freightStatus, setFreightStatus] = useState<FreightStatusRecord[]>([]);
  const esRef = useRef<EventSource | null>(null);

  // Fetch community reports and freight camera status periodically
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/report");
      if (!res.ok) return;
      const raw: Array<{ crossing: string; reported_at: string; duration_minutes: number | null }> = await res.json();
      setCommunityReports(
        raw.map((r) => ({
          crossingId: r.crossing,
          reported_at: r.reported_at,
          duration_minutes: r.duration_minutes ?? 0,
        }))
      );
    } catch { /* non-fatal */ }
  }, []);

  const fetchFreightStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/freight-status");
      if (!res.ok) return;
      const data: FreightStatusRecord[] = await res.json();
      setFreightStatus(data);
    } catch { /* non-fatal — worker may not be running */ }
  }, []);

  // Fallback: one-shot fetch from /api/trains
  const fallbackFetch = useCallback(async () => {
    try {
      const res = await fetch("/api/trains");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, []);

  // Manual refresh button — closes SSE, falls back to one-shot, then reconnects SSE
  const refresh = useCallback(() => {
    fallbackFetch();
  }, [fallbackFetch]);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failure is non-fatal
      });
    }

    // Fetch community reports + freight camera status on mount and periodically
    fetchReports();
    fetchFreightStatus();
    const reportInterval = setInterval(fetchReports, 120_000);
    const freightInterval = setInterval(fetchFreightStatus, 30_000);

    const connect = () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const es = new EventSource("/api/trains/stream");
      esRef.current = es;

      es.onmessage = (evt) => {
        try {
          const json: ApiResponse = JSON.parse(evt.data);
          if (json.error) {
            setError(json.error);
            return;
          }
          setData(json);
          setLastRefresh(new Date());
          setError(null);
        } catch {
          setError("Failed to parse stream data");
        }
      };

      es.onerror = () => {
        // SSE failed — do one fallback fetch and show error state
        es.close();
        esRef.current = null;
        fallbackFetch().then(() => {
          setError("Live stream unavailable — showing last known data");
        });
      };
    };

    connect();

    return () => {
      clearInterval(reportInterval);
      clearInterval(freightInterval);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [fallbackFetch, fetchReports, fetchFreightStatus]);

  const hasApproaching = data?.trains.some((t) =>
    t.crossings.some((c) => c.approaching)
  );

  return (
    <div className="app">
      <header className={`site-header ${hasApproaching ? "alerting" : ""}`}>
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">🚦</span>
            <div>
              <h1>ClearPath</h1>
              <p className="brand-sub">{config.name}, {config.state} — Grade Crossing Monitor</p>
            </div>
          </div>
          <div className="header-meta">
            {lastRefresh && (
              <span className="refresh-time">
                Live · {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button className="refresh-btn" onClick={refresh}>↻ Refresh</button>
          </div>
        </div>
        {hasApproaching && (
          <div className="alert-banner">
            ⚠ Train approaching — crossings may be blocked
          </div>
        )}
      </header>

      <main className="main-layout">
        <section className="map-section">
          {data ? (
            <TrainMap config={config} trains={data.trains} />
          ) : (
            <div className="map-loading">
              {error ? (
                <p className="error-msg">⚠ {error}</p>
              ) : (
                <p>Loading train data…</p>
              )}
            </div>
          )}
        </section>

        <aside className="sidebar">
          {data ? (
            <>
              <CrossingStatus
                trains={data.trains}
                fetchedAt={data.fetchedAt}
                communityReports={communityReports}
                viaductNote={config.viaductNote}
                freightStatus={freightStatus}
              />

              {data.trains.some((t) => t.nextStation) && (
                <div className="next-station-panel">
                  <h3>Next Station</h3>
                  {data.trains
                    .filter((t) => t.nextStation)
                    .map((t) => (
                      <div key={t.trainNumber} className="next-station-row">
                        <span className="train-id">
                          #{t.trainNumber} {t.trainName}
                        </span>
                        <span className="next-station-info">
                          {t.nextStation!.name}
                          {t.nextStation!.schArr && (
                            <span className="next-station-arr">
                              {" "}arr {new Date(t.nextStation!.schArr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="loading-sidebar">
              <p>Fetching live data…</p>
            </div>
          )}

          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-row"><span className="dot red" /> Grade crossing</div>
            <div className="legend-row"><span className="badge blue">🚆 5</span> Amtrak train</div>
            <div className="legend-row"><span className="badge amber">🚆 6</span> Train approaching (&lt;20 min)</div>
          </div>

          <div className="info-box">
            <h3>About ClearPath</h3>
            <p>
              Real-time Amtrak position data for the California Zephyr corridor.
              Helps first responders plan routes around blocked grade crossings.
            </p>
            <p>
              <strong>Freight:</strong> detected via public camera (best-effort).
              Camera inference is not authoritative dispatch data.
            </p>
            <p>
              <a
                href="https://github.com/Kevinchamplin/clearpath"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open source on GitHub →
              </a>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
