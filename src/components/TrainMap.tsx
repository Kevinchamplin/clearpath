"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { TownConfig, Crossing } from "@/config/town";
import type { TrainPosition } from "@/lib/amtrak";
import TrainInfoModal, { type SelectedTrain } from "./TrainInfoModal";

interface Props {
  config: TownConfig;
  trains: (TrainPosition & { crossings: CrossingEta[] })[];
}

interface CrossingEta {
  crossingId: string;
  crossingName: string;
  distanceMiles: number;
  etaMinutes: number | null;
  approaching: boolean;
}

export default function TrainMap({ config, trains }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTrain, setSelectedTrain] = useState<SelectedTrain | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref so Leaflet event handlers always call the latest setter (stale-closure safe)
  const openModalRef = useRef<(t: SelectedTrain) => void>(() => {});
  const scheduleCloseRef = useRef<() => void>(() => {});

  openModalRef.current = (t: SelectedTrain) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSelectedTrain(t);
  };

  scheduleCloseRef.current = () => {
    closeTimerRef.current = setTimeout(() => setSelectedTrain(null), 450);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!).setView(
        [config.lat, config.lng],
        config.zoom
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Crossing markers (red)
      const crossingIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#dc2626;border:3px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.4);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      config.crossings.forEach((c: Crossing) => {
        L.marker([c.lat, c.lng], { icon: crossingIcon })
          .addTo(map)
          .bindPopup(`<strong>${c.name}</strong><br/>FRA ID: ${c.id}`);
      });

      renderTrains(L, map, trains, config.crossings, openModalRef, scheduleCloseRef);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update train markers when data refreshes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      mapRef.current!.eachLayer((layer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((layer as any)._isTrain) mapRef.current!.removeLayer(layer);
      });
      renderTrains(L, mapRef.current!, trains, config.crossings, openModalRef, scheduleCloseRef);
    });
  }, [trains, config.crossings]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Leaflet owns this div — never put React children inside it */}
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Train info modal — sibling to the map, overlaid via CSS */}
      {selectedTrain && (
        <div
          className="train-modal-overlay"
          onMouseEnter={cancelClose}
          onMouseLeave={() => scheduleCloseRef.current()}
        >
          <TrainInfoModal
            train={selectedTrain}
            onClose={() => setSelectedTrain(null)}
          />
        </div>
      )}
    </div>
  );
}

function renderTrains(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  trains: (TrainPosition & { crossings: CrossingEta[] })[],
  crossings: Crossing[],
  openModalRef: React.MutableRefObject<(t: TrainPosition & { crossings: CrossingEta[] }) => void>,
  scheduleCloseRef: React.MutableRefObject<() => void>
) {
  trains.forEach((train) => {
    const hasApproaching = train.crossings.some((c) => c.approaching);
    const color = hasApproaching ? "#f59e0b" : "#2563eb";

    const trainIcon = L.divIcon({
      className: "",
      html: `<div style="
        background:${color};color:#fff;
        font-size:11px;font-weight:700;
        padding:3px 7px;border-radius:12px;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
        white-space:nowrap;cursor:pointer;
        ${hasApproaching ? "animation:pulse 1s infinite;" : ""}
      ">🚆 ${train.trainNumber}</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });

    const marker = L.marker([train.lat, train.lng], { icon: trainIcon }).addTo(map);

    // Desktop: hover to open, leave to start close timer
    marker.on("mouseover", () => openModalRef.current(train));
    marker.on("mouseout", () => scheduleCloseRef.current());
    // Mobile / click: toggle
    marker.on("click", () => openModalRef.current(train));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (marker as any)._isTrain = true;
  });
}
