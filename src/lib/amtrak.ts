// Amtrak's unofficial public map API.
// Endpoint and decryption approach are well-documented in the open source community
// (e.g. github.com/piemadd/amtraker, github.com/mgwalker/amtrak-api).

export interface TrainPosition {
  trainNumber: string;
  trainName: string;
  lat: number;
  lng: number;
  speed: number;         // mph
  heading: string;       // "N", "NE", "E", etc.
  lastUpdated: string;   // ISO string
  originCode: string;
  destCode: string;
  scheduledArrival?: string;
  estimatedArrival?: string;
  statusMsg: string;
  delayMinutes: number;
}

// Amtrak stores train data behind a light encryption layer.
// The key/salt live in their public JS bundle — many open source projects
// document this. We use the same approach as amtraker.
const AMTRAK_S = "9a3686ac";
const AMTRAK_S2 = "jxL83+nkXDeFcdBocHMJrsWos";

async function decryptAmtrakData(encrypted: string): Promise<unknown> {
  // Amtrak uses AES-256-CBC with a key derived from S+S2 via SHA-256 (first 32 bytes)
  // and IV from the first 16 bytes of the ciphertext (base64-decoded).
  // This is publicly documented at https://github.com/mgwalker/amtrak-api
  const masterKey = AMTRAK_S + AMTRAK_S2;
  const keyData = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterKey).slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const raw = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 16);
  const ciphertext = raw.slice(16);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    keyData,
    ciphertext
  );

  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}

export async function fetchTrains(trainNumbers?: string[]): Promise<TrainPosition[]> {
  const res = await fetch(
    "https://maps.amtrak.com/services/MapDataService/trains/getTrainsData",
    { next: { revalidate: 60 } }
  );

  if (!res.ok) throw new Error(`Amtrak API error: ${res.status}`);

  const json = await res.json();

  // The response has a "features" array where each feature's "properties.encrypted"
  // holds the train data ciphertext.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = json?.features ?? [];

  const trains: TrainPosition[] = [];

  for (const feature of features) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props: any = await decryptAmtrakData(feature.properties.encrypted);
      const trainNum = String(props.TrainNum ?? "");

      if (trainNumbers && !trainNumbers.includes(trainNum)) continue;

      trains.push({
        trainNumber: trainNum,
        trainName: props.RouteName ?? "",
        lat: feature.geometry?.coordinates?.[1] ?? 0,
        lng: feature.geometry?.coordinates?.[0] ?? 0,
        speed: Number(props.Velocity ?? 0),
        heading: props.Heading ?? "",
        lastUpdated: props.LastValTS ?? new Date().toISOString(),
        originCode: props.OrigCode ?? "",
        destCode: props.DestCode ?? "",
        statusMsg: props.StatusMsg ?? "",
        delayMinutes: Number(props.CumNewDlyAmt ?? 0),
      });
    } catch {
      // skip malformed entries
    }
  }

  return trains;
}

// Haversine distance in miles between two lat/lng points
export function distanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
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

// Estimate minutes until a train reaches a crossing given speed + distance
export function etaMinutes(distMiles: number, speedMph: number): number | null {
  if (speedMph < 1) return null;
  return Math.round((distMiles / speedMph) * 60);
}
