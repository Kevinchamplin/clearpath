import { NextResponse } from "next/server";
import { fetchTrains, distanceMiles, etaMinutes } from "@/lib/amtrak";
import config from "@/config/town";

export const runtime = "edge";
export const revalidate = 60;

export async function GET() {
  try {
    const trains = await fetchTrains(config.watchTrains);

    // For each train, compute distance + ETA to every crossing
    const enriched = trains.map((train) => ({
      ...train,
      crossings: config.crossings.map((crossing) => {
        const dist = distanceMiles(train.lat, train.lng, crossing.lat, crossing.lng);
        const eta = etaMinutes(dist, train.speed);
        return {
          crossingId: crossing.id,
          crossingName: crossing.name,
          distanceMiles: Math.round(dist * 10) / 10,
          etaMinutes: eta,
          // Approaching = within 10 miles and heading generally toward the crossing
          approaching: dist < 10 && eta !== null && eta < 20,
        };
      }),
    }));

    return NextResponse.json({
      trains: enriched,
      crossings: config.crossings,
      town: { name: config.name, state: config.state, lat: config.lat, lng: config.lng },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Train fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch train data" }, { status: 502 });
  }
}
