"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { TownConfig, Crossing } from "@/config/town";
import type { TrainPosition } from "@/lib/amtrak";

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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet must be imported client-side (no SSR)
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

      // Train markers
      renderTrains(L, map, trains, config.crossings);
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
      // Remove existing train layers
      mapRef.current!.eachLayer((layer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((layer as any)._isTrain) mapRef.current!.removeLayer(layer);
      });
      renderTrains(L, mapRef.current!, trains, config.crossings);
    });
  }, [trains, config.crossings]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

function renderTrains(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  trains: (TrainPosition & { crossings: CrossingEta[] })[],
  crossings: Crossing[]
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
        white-space:nowrap;
        ${hasApproaching ? "animation:pulse 1s infinite;" : ""}
      ">🚆 ${train.trainNumber}</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });

    const closestCrossing = [...train.crossings].sort(
      (a, b) => a.distanceMiles - b.distanceMiles
    )[0];

    const popupLines = crossings.map((c) => {
      const eta = train.crossings.find((tc) => tc.crossingId === c.id);
      const etaStr =
        eta?.etaMinutes != null
          ? `<span style="color:${eta.approaching ? "#dc2626" : "#374151"}">${eta.etaMinutes} min</span>`
          : "—";
      return `<tr><td style="padding:2px 8px 2px 0">${c.name}</td><td>${etaStr}</td></tr>`;
    });

    const marker = L.marker([train.lat, train.lng], { icon: trainIcon })
      .addTo(map)
      .bindPopup(`
        <strong>Train ${train.trainNumber} — ${train.trainName}</strong><br/>
        Speed: ${train.speed} mph &nbsp;|&nbsp; Heading: ${train.heading}<br/>
        Delay: ${train.delayMinutes > 0 ? `+${train.delayMinutes} min` : "on time"}<br/>
        Nearest crossing: ${closestCrossing?.distanceMiles} mi<br/><br/>
        <table style="font-size:12px;width:100%">
          <thead><tr><th style="text-align:left">Crossing</th><th>ETA</th></tr></thead>
          <tbody>${popupLines.join("")}</tbody>
        </table>
      `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (marker as any)._isTrain = true;
  });
}
