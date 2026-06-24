"use client";

import { useEffect, useState } from "react";
import { getTrainInfo } from "@/lib/trainInfo";
import type { TrainPosition } from "@/lib/amtrak";

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

export type SelectedTrain = TrainPosition & { crossings: CrossingEta[] };

interface Props {
  train: SelectedTrain;
  onClose: () => void;
}

export default function TrainInfoModal({ train, onClose }: Props) {
  const info = getTrainInfo(train.trainNumber, train.trainName);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Fetch Wikipedia thumbnail live — reliable, no guessing file paths
  useEffect(() => {
    if (!info?.wikiTitle) return;
    let cancelled = false;
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(info.wikiTitle)}`,
      { headers: { Accept: "application/json" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.thumbnail?.source) setImgSrc(data.thumbnail.source);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [info?.wikiTitle]);

  const closestCrossing = [...train.crossings]
    .filter((c) => c.etaMinutes !== null)
    .sort((a, b) => (a.etaMinutes ?? 9999) - (b.etaMinutes ?? 9999))[0];

  const isDelayed = train.delayMinutes > 0;

  return (
    <div className="train-info-modal" role="dialog" aria-label={`Train ${train.trainNumber} info`}>
      {/* Header */}
      <div className="tim-header">
        <div className="tim-badge">#{train.trainNumber}</div>
        <div className="tim-title-block">
          <div className="tim-name">{train.trainName}</div>
          {info && <div className="tim-type">{info.type}</div>}
        </div>
        <button className="tim-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Photo */}
      {imgSrc && (
        <div className="tim-photo">
          <img src={imgSrc} alt={`${train.trainName} train`} loading="lazy" />
        </div>
      )}

      {/* Live stats */}
      <div className="tim-live">
        <div className="tim-stat">
          <span className="tim-stat-value">{train.speed}</span>
          <span className="tim-stat-label">mph</span>
        </div>
        <div className="tim-stat">
          <span className="tim-stat-value" data-delayed={isDelayed ? "true" : undefined}>
            {isDelayed ? `+${train.delayMinutes}m` : "On time"}
          </span>
          <span className="tim-stat-label">delay</span>
        </div>
        {closestCrossing && (
          <div className="tim-stat">
            <span className="tim-stat-value">{closestCrossing.distanceMiles}</span>
            <span className="tim-stat-label">mi away</span>
          </div>
        )}
        {closestCrossing?.etaMinutes != null && (
          <div className="tim-stat">
            <span className="tim-stat-value" data-approaching={closestCrossing.approaching ? "true" : undefined}>
              {closestCrossing.etaMinutes}
            </span>
            <span className="tim-stat-label">min ETA</span>
          </div>
        )}
      </div>

      {/* Train facts */}
      {info && (
        <dl className="tim-facts">
          <div className="tim-fact-row">
            <dt>Route</dt>
            <dd>{info.route}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Service</dt>
            <dd>{info.frequency}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Locomotive</dt>
            <dd>{info.locomotive}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Consist</dt>
            <dd>{info.consist}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Cars</dt>
            <dd>{info.typicalCars}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Length</dt>
            <dd>{info.estimatedLength}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Weight</dt>
            <dd>{info.estimatedWeight}</dd>
          </div>
          <div className="tim-fact-row">
            <dt>Max speed</dt>
            <dd>{info.maxSpeed}</dd>
          </div>
        </dl>
      )}

      {/* Fun fact */}
      {info?.funFact && (
        <div className="tim-funfact">
          <span className="tim-funfact-icon">🚆</span>
          {info.funFact}
        </div>
      )}

      {/* Wikipedia link */}
      {info?.wikiUrl && (
        <a
          href={info.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tim-wiki-link"
        >
          Read more on Wikipedia ↗
        </a>
      )}
    </div>
  );
}
