// Train data via the amtraker public API (api.amtraker.com/v3)
// Maintained by Piemadd — a clean JSON wrapper around Amtrak's encrypted map API.

export interface TrainPosition {
  trainNumber: string;
  trainName: string;
  lat: number;
  lng: number;
  speed: number;       // mph
  heading: string;     // "N", "NE", "SW", etc.
  lastUpdated: string; // ISO string
  originCode: string;
  destCode: string;
  statusMsg: string;
  delayMinutes: number;
  nextStation?: { code: string; name: string; schArr: string | null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmtrakerTrain = Record<string, any>;

export async function fetchTrains(trainNumbers?: string[]): Promise<TrainPosition[]> {
  const url = "https://api.amtraker.com/v3/trains";
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`amtraker API error: ${res.status}`);

  const json: Record<string, AmtrakerTrain[]> = await res.json();

  const results: TrainPosition[] = [];

  for (const [num, instances] of Object.entries(json)) {
    if (trainNumbers && !trainNumbers.includes(num)) continue;

    for (const t of instances) {
      if (t.trainState !== "Active") continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stations: any[] = Array.isArray(t.stations) ? t.stations : [];
      const next = stations.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => !String(s.status ?? "").toLowerCase().startsWith("departed")
      );

      results.push({
        trainNumber: String(t.trainNum ?? num),
        trainName: String(t.routeName ?? ""),
        lat: Number(t.lat),
        lng: Number(t.lon),
        speed: Number(t.velocity ?? 0),
        heading: String(t.heading ?? ""),
        lastUpdated: String(t.lastValTS ?? t.updatedAt ?? ""),
        originCode: String(t.origCode ?? ""),
        destCode: String(t.destCode ?? ""),
        statusMsg: String(t.statusMsg ?? "").trim(),
        // amtraker doesn't expose delay minutes directly; trainTimely is a string
        delayMinutes: parseDelayMinutes(t.trainTimely),
        nextStation: next
          ? {
              code: String(next.stnCode ?? ""),
              name: String(next.stnName ?? next.stnCode ?? ""),
              schArr: next.schArr ? String(next.schArr) : null,
            }
          : undefined,
      });
    }
  }

  return results;
}

function parseDelayMinutes(timely: string): number {
  if (!timely || timely === "" || timely.toLowerCase().includes("on time")) return 0;
  // e.g. "15 Minutes Late" → 15
  const match = timely.match(/(\d+)\s*min/i);
  return match ? parseInt(match[1], 10) : 0;
}

// Haversine distance in miles
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimate minutes until a train reaches a crossing
export function etaMinutes(distMiles: number, speedMph: number): number | null {
  if (speedMph < 1) return null;
  return Math.round((distMiles / speedMph) * 60);
}
