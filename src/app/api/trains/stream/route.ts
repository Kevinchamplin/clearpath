export const runtime = 'nodejs';

import config from '@/config/town';

const PUSH_INTERVAL_MS = 30_000;
const AMTRAKER_URL = 'https://api.amtraker.com/v3/trains';

interface AmtrakerStation {
  stationCode: string;
  stationName: string;
  status: string;         // "Departed", "On Time", "Late", etc.
  schArr: string;         // scheduled arrival ISO string
  schDep: string;
  estArr?: string;
  estDep?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmtrakerTrain = Record<string, any>;

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function etaMinutes(distMiles: number, speedMph: number): number | null {
  if (speedMph < 1) return null;
  return Math.round((distMiles / speedMph) * 60);
}

function parseDelayMinutes(timely: string): number {
  if (!timely || timely === '' || timely.toLowerCase().includes('on time')) return 0;
  const match = timely.match(/(\d+)\s*min/i);
  return match ? parseInt(match[1], 10) : 0;
}

function nextStationFromRaw(stations: AmtrakerStation[]): { name: string; schArr: string } | undefined {
  if (!Array.isArray(stations)) return undefined;
  const next = stations.find((s) => s.status !== 'Departed');
  if (!next) return undefined;
  return { name: next.stationName ?? next.stationCode, schArr: next.schArr ?? '' };
}

async function buildApiResponse(): Promise<string> {
  const res = await fetch(AMTRAKER_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Amtraker HTTP ${res.status}`);

  const json: Record<string, AmtrakerTrain[]> = await res.json();
  const watchSet = new Set(config.watchTrains);

  const enriched = [];

  for (const [num, instances] of Object.entries(json)) {
    if (!watchSet.has(num)) continue;

    for (const t of instances) {
      if (t.trainState !== 'Active') continue;

      const lat = Number(t.lat);
      const lng = Number(t.lon);
      const speed = Number(t.velocity ?? 0);

      const crossings = config.crossings.map((crossing) => {
        const dist = distanceMiles(lat, lng, crossing.lat, crossing.lng);
        const eta = etaMinutes(dist, speed);
        return {
          crossingId: crossing.id,
          crossingName: crossing.name,
          distanceMiles: Math.round(dist * 10) / 10,
          etaMinutes: eta,
          approaching: dist < 10 && eta !== null && eta < 20,
        };
      });

      enriched.push({
        trainNumber: String(t.trainNum ?? num),
        trainName: String(t.routeName ?? ''),
        lat,
        lng,
        speed,
        heading: String(t.heading ?? ''),
        lastUpdated: String(t.lastValTS ?? t.updatedAt ?? ''),
        originCode: String(t.origCode ?? ''),
        destCode: String(t.destCode ?? ''),
        statusMsg: String(t.statusMsg ?? '').trim(),
        delayMinutes: parseDelayMinutes(t.trainTimely),
        crossings,
        nextStation: nextStationFromRaw(t.stations as AmtrakerStation[]),
      });
    }
  }

  const payload = {
    trains: enriched,
    crossings: config.crossings,
    town: { name: config.name, state: config.state },
    fetchedAt: new Date().toISOString(),
  };

  return JSON.stringify(payload);
}

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let timer: ReturnType<typeof setInterval> | null = null;

      const send = async () => {
        if (closed) return;
        try {
          const payload = await buildApiResponse();
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'stream error';
          controller.enqueue(encoder.encode(`data: {"error":"${msg}"}\n\n`));
        }
      };

      // Send immediately on connect
      send();

      // Then push every 30 seconds
      timer = setInterval(send, PUSH_INTERVAL_MS);

      // Keep-alive comment every 15s so proxies don't close idle connections
      const keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          // stream already closed
        }
      }, 15_000);

      // cancel() is called when the client disconnects
      return () => {
        closed = true;
        if (timer) clearInterval(timer);
        clearInterval(keepAlive);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering for SSE
    },
  });
}
