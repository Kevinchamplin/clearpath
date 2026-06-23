"use client";

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
  alternateRouteNote?: string;
}

interface TrainWithCrossings {
  trainNumber: string;
  trainName: string;
  speed: number;
  delayMinutes: number;
  crossings: CrossingEta[];
  nextStation?: { code: string; name: string; schArr: string | null };
}

interface CommunityReport {
  crossingId: string;
  reported_at: string;
  duration_minutes: number;
}

export interface FreightStatus {
  crossing_id: string;
  state: "CLEAR" | "BLOCKED" | "UNKNOWN";
  confidence: number;
  blocked_since: string | null;
  updated_at: string;
}

interface Props {
  trains: TrainWithCrossings[];
  fetchedAt: string;
  communityReports?: CommunityReport[];
  viaductNote?: string;
  freightStatus?: FreightStatus[];
}

// Only show trains within 8 hours (480 min) — anything beyond is not actionable
const MAX_ETA_MIN = 480;

interface CrossingAlert {
  trainNumber: string;
  trainName: string;
  distanceMiles: number;
  etaMinutes: number;
  approaching: boolean;
  speed: number;
  delayMinutes: number;
  nextStation?: { code: string; name: string; schArr: string | null };
}

export default function CrossingStatus({
  trains,
  fetchedAt,
  communityReports = [],
  viaductNote,
  freightStatus = [],
}: Props) {
  // Build per-crossing view: which trains are closest and approaching
  const crossingMap: Record<
    string,
    { name: string; alerts: CrossingAlert[]; alternateRouteNote?: string }
  > = {};

  trains.forEach((train) => {
    train.crossings.forEach((c) => {
      if (!crossingMap[c.crossingId]) {
        crossingMap[c.crossingId] = {
          name: c.crossingName,
          alerts: [],
          alternateRouteNote: c.alternateRouteNote,
        };
      }
      if (c.etaMinutes !== null && c.etaMinutes <= MAX_ETA_MIN) {
        crossingMap[c.crossingId].alerts.push({
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          distanceMiles: c.distanceMiles,
          etaMinutes: c.etaMinutes,
          approaching: c.approaching,
          speed: train.speed,
          delayMinutes: train.delayMinutes,
          nextStation: train.nextStation,
        });
      }
    });
  });

  // Sort alerts by ETA ascending
  Object.values(crossingMap).forEach((c) =>
    c.alerts.sort((a, b) => a.etaMinutes - b.etaMinutes)
  );

  const updated = new Date(fetchedAt).toLocaleTimeString();
  const nowMs = Date.now();

  // Any crossing currently approaching?
  const anyApproaching = Object.values(crossingMap).some((c) =>
    c.alerts.some((a) => a.approaching)
  );

  // Lookup community report for a crossing within the last 2 hours
  function recentReport(crossingId: string): CommunityReport | undefined {
    const twoHoursMs = 2 * 60 * 60 * 1000;
    return communityReports.find((r) => {
      if (r.crossingId !== crossingId) return false;
      const ageMs = nowMs - new Date(r.reported_at).getTime();
      return ageMs >= 0 && ageMs <= twoHoursMs;
    });
  }

  return (
    <div className="crossing-status">
      <div className="status-header">
        <h2>Crossing Status</h2>
        <span className="updated">Updated {updated}</span>
      </div>

      {/* Viaduct note — shown whenever any train is approaching */}
      {anyApproaching && viaductNote && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #ca8a04",
            borderRadius: "6px",
            padding: "10px 14px",
            margin: "12px 12px 0",
            fontSize: "0.875rem",
            color: "#713f12",
          }}
        >
          ℹ️ {viaductNote}
        </div>
      )}

      {Object.entries(crossingMap).map(([id, crossing]) => {
        const hasAlert = crossing.alerts.some((a) => a.approaching);
        const report = recentReport(id);
        const reportAgeMin = report
          ? Math.floor((nowMs - new Date(report.reported_at).getTime()) / 60000)
          : null;

        // Determine freight state for this crossing
        const fs = freightStatus.find((f) => f.crossing_id === id);
        const freightBlocked = fs?.state === "BLOCKED";
        const freightAgeMin = fs
          ? Math.floor((nowMs - new Date(fs.updated_at).getTime()) / 60000)
          : null;
        const blockedMin = fs?.blocked_since
          ? Math.floor((nowMs - new Date(fs.blocked_since).getTime()) / 60000)
          : null;

        // Determine card class
        let cardClass = "crossing-card";
        if (freightBlocked) {
          cardClass += " blocked";
        } else if (hasAlert) {
          cardClass += " alert";
        } else {
          cardClass += " clear";
        }

        // Determine status pill
        let pillClass = "status-pill";
        let pillText = "CLEAR";
        let pillIcon = "✓";

        if (freightBlocked) {
          pillClass += " blocked";
          pillText = "BLOCKED";
          pillIcon = "✕";
        } else if (hasAlert) {
          pillClass += " approaching";
          const minEta = crossing.alerts.find((a) => a.approaching)?.etaMinutes;
          pillText = minEta != null ? `IN ${minEta} MIN` : "APPROACHING";
          pillIcon = "⚠";
        } else {
          pillClass += " clear";
          pillText = "CLEAR";
          pillIcon = "✓";
        }

        // Freight badge class
        const freightBadgeClass = fs
          ? `freight-badge freight-${fs.state.toLowerCase()}`
          : null;
        const freightIcon =
          fs?.state === "BLOCKED" ? "🔴" : fs?.state === "CLEAR" ? "🟢" : "⚫";
        const freightLabel =
          fs?.state === "BLOCKED"
            ? `Freight blocked ${blockedMin ?? "?"}m`
            : fs?.state === "CLEAR"
            ? "Freight clear"
            : "Freight status unknown";

        return (
          <div key={id} className={cardClass}>
            {/* Card Header */}
            <div className="crossing-card-header">
              <span className="crossing-name">
                {crossing.name}
              </span>
              <span className={pillClass}>
                {pillIcon} {pillText}
              </span>
            </div>

            {/* Freight camera badge */}
            {fs && freightBadgeClass && (
              <div className={freightBadgeClass}>
                <span>{freightIcon}</span>
                <span>
                  <span className="freight-badge-label">{freightLabel}</span>
                  <span style={{ marginLeft: 8, opacity: 0.65 }}>
                    · updated {freightAgeMin}m ago
                  </span>
                  <span className="freight-camera-note">
                    📷 camera inference — not authoritative dispatch data
                  </span>
                </span>
              </div>
            )}

            {/* Card Body */}
            <div className="crossing-card-body">
              {/* Community freight report */}
              {report && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #d97706",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    marginBottom: "8px",
                    fontSize: "13px",
                    color: "#92400e",
                  }}
                >
                  📋 Community report: freight blocked {report.duration_minutes} min —{" "}
                  {reportAgeMin} min ago
                </div>
              )}

              {crossing.alerts.length === 0 ? (
                <p className="no-trains">No trains tracked within 8 hours</p>
              ) : (
                crossing.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.trainNumber} className="train-row">
                    <div>
                      <div className="train-name">
                        #{alert.trainNumber} {alert.trainName}
                      </div>
                      <div className="train-meta">
                        {alert.distanceMiles} mi away
                        {alert.nextStation?.name && alert.nextStation.name !== "undefined"
                          ? ` · Next: ${alert.nextStation.name}`
                          : ""}
                        {alert.delayMinutes > 0 && ` · +${alert.delayMinutes}m late`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="train-eta-value">{alert.etaMinutes}</div>
                      <div className="train-eta-label">min</div>
                    </div>
                  </div>
                ))
              )}

              {/* Alternate route note */}
              {crossing.alternateRouteNote && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  {crossing.alternateRouteNote}
                </div>
              )}

              {/* BNSF/FRA contact — only when approaching */}
              {hasAlert && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                  Report to{" "}
                  <a href="tel:18008325452" style={{ color: "var(--blue)" }}>
                    BNSF 1-800-832-5452
                  </a>{" "}
                  ·{" "}
                  <a href="tel:18004240201" style={{ color: "var(--blue)" }}>
                    FRA 1-800-424-0201
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {trains.length === 0 && (
        <div className="crossing-card clear">
          <div className="crossing-card-body">
            <p className="no-trains">No trains currently tracked.</p>
          </div>
        </div>
      )}
    </div>
  );
}
