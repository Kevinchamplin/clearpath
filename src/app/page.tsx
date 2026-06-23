"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import CrossingStatus from "@/components/CrossingStatus";
import config from "@/config/town";

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
}

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

const REFRESH_INTERVAL = 60_000;

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
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

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

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
            <CrossingStatus trains={data.trains} fetchedAt={data.fetchedAt} />
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
              <strong>Note:</strong> Freight train data is not publicly available.
              This tool tracks Amtrak trains only.
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
