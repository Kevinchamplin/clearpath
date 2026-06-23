"use client";

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

interface TrainWithCrossings {
  trainNumber: string;
  trainName: string;
  speed: number;
  delayMinutes: number;
  crossings: CrossingEta[];
}

interface Props {
  trains: TrainWithCrossings[];
  fetchedAt: string;
}

export default function CrossingStatus({ trains, fetchedAt }: Props) {
  // Build per-crossing view: which trains are closest and approaching
  const crossingMap: Record<string, { name: string; alerts: CrossingAlert[] }> = {};

  trains.forEach((train) => {
    train.crossings.forEach((c) => {
      if (!crossingMap[c.crossingId]) {
        crossingMap[c.crossingId] = { name: c.crossingName, alerts: [] };
      }
      if (c.etaMinutes !== null) {
        crossingMap[c.crossingId].alerts.push({
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          distanceMiles: c.distanceMiles,
          etaMinutes: c.etaMinutes,
          approaching: c.approaching,
          speed: train.speed,
        });
      }
    });
  });

  // Sort alerts by ETA ascending
  Object.values(crossingMap).forEach((c) =>
    c.alerts.sort((a, b) => a.etaMinutes - b.etaMinutes)
  );

  const updated = new Date(fetchedAt).toLocaleTimeString();

  return (
    <div className="crossing-status">
      <div className="status-header">
        <h2>Crossing Status</h2>
        <span className="updated">Updated {updated}</span>
      </div>

      {Object.entries(crossingMap).map(([id, crossing]) => {
        const hasAlert = crossing.alerts.some((a) => a.approaching);
        return (
          <div key={id} className={`crossing-card ${hasAlert ? "alert" : "clear"}`}>
            <div className="crossing-name">
              <span className={`dot ${hasAlert ? "red" : "green"}`} />
              {crossing.name}
            </div>

            {crossing.alerts.length === 0 ? (
              <p className="no-trains">No trains tracked nearby</p>
            ) : (
              crossing.alerts.map((alert) => (
                <div key={alert.trainNumber} className={`train-eta ${alert.approaching ? "approaching" : ""}`}>
                  <span className="train-id">#{alert.trainNumber} {alert.trainName}</span>
                  <span className="eta-badge">
                    {alert.approaching ? "⚠ " : ""}
                    {alert.etaMinutes} min &nbsp;·&nbsp; {alert.distanceMiles} mi
                  </span>
                </div>
              ))
            )}
          </div>
        );
      })}

      {trains.length === 0 && (
        <div className="crossing-card clear">
          <p className="no-trains">No California Zephyr trains currently tracked.</p>
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
}
