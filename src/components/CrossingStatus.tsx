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
  nextStation?: { name: string; schArr: string };
}

interface CommunityReport {
  crossingId: string;
  reported_at: string;
  duration_minutes: number;
}

interface Props {
  trains: TrainWithCrossings[];
  fetchedAt: string;
  communityReports?: CommunityReport[];
  viaductNote?: string;
}

export default function CrossingStatus({
  trains,
  fetchedAt,
  communityReports = [],
  viaductNote,
}: Props) {
  // Build per-crossing view: which trains are closest and approaching
  const crossingMap: Record<string, { name: string; alerts: CrossingAlert[]; alternateRouteNote?: string }> = {};

  trains.forEach((train) => {
    train.crossings.forEach((c) => {
      if (!crossingMap[c.crossingId]) {
        crossingMap[c.crossingId] = {
          name: c.crossingName,
          alerts: [],
          alternateRouteNote: c.alternateRouteNote,
        };
      }
      if (c.etaMinutes !== null) {
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
        <div className="viaduct-note" style={{
          background: "#fef9c3",
          border: "1px solid #ca8a04",
          borderRadius: "6px",
          padding: "10px 14px",
          marginBottom: "12px",
          fontSize: "0.875rem",
          color: "#713f12",
        }}>
          ℹ️ {viaductNote}
        </div>
      )}

      {Object.entries(crossingMap).map(([id, crossing]) => {
        const hasAlert = crossing.alerts.some((a) => a.approaching);
        const report = recentReport(id);
        const reportAgeMin = report
          ? Math.floor((nowMs - new Date(report.reported_at).getTime()) / 60000)
          : null;

        return (
          <div key={id} className={`crossing-card ${hasAlert ? "alert" : "clear"}`}>
            <div className="crossing-name">
              <span className={`dot ${hasAlert ? "red" : "green"}`} />
              {crossing.name}
            </div>

            {/* Community freight report */}
            {report && (
              <div style={{
                background: "#fffbeb",
                border: "1px solid #d97706",
                borderRadius: "4px",
                padding: "6px 10px",
                margin: "6px 0",
                fontSize: "0.8rem",
                color: "#92400e",
              }}>
                📋 Community report: freight blocked {report.duration_minutes} min — {reportAgeMin} min ago
              </div>
            )}

            {/* BNSF emergency contacts — shown when a train is approaching */}
            {hasAlert && (
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>
                Report to BNSF: 1-800-832-5452 | FRA Safety: 1-800-424-0201
              </div>
            )}

            {crossing.alerts.length === 0 ? (
              <p className="no-trains">No trains tracked nearby</p>
            ) : (
              crossing.alerts.map((alert) => (
                <div key={alert.trainNumber} className={`train-eta ${alert.approaching ? "approaching" : ""}`}>
                  <span className="train-id">
                    #{alert.trainNumber} {alert.trainName}
                    {alert.nextStation && (
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", fontWeight: "normal" }}>
                        Next stop: {alert.nextStation.name}
                      </span>
                    )}
                  </span>
                  <span className="eta-badge">
                    {alert.approaching ? "⚠ " : ""}
                    {alert.etaMinutes} min &nbsp;·&nbsp; {alert.distanceMiles} mi
                    {alert.delayMinutes > 0 && (
                      <span style={{
                        display: "inline-block",
                        marginLeft: "6px",
                        background: "#fef3c7",
                        color: "#b45309",
                        borderRadius: "4px",
                        padding: "1px 5px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}>
                        +{alert.delayMinutes}m late
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}

            {/* Alternate route note for this crossing */}
            {crossing.alternateRouteNote && (
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "6px" }}>
                {crossing.alternateRouteNote}
              </div>
            )}
          </div>
        );
      })}

      {trains.length === 0 && (
        <div className="crossing-card clear">
          <p className="no-trains">No trains currently tracked.</p>
        </div>
      )}
    </div>
  );
}

interface CrossingAlert {
  trainNumber: string;
  trainName: string;
  distanceMiles: number;
  etaMinutes: number;
  approaching: boolean;
  speed: number;
  delayMinutes: number;
  nextStation?: { name: string; schArr: string };
}
