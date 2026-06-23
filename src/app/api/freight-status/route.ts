import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 30;

export interface FreightStatusRecord {
  crossing_id: string;
  state: "CLEAR" | "BLOCKED" | "UNKNOWN";
  confidence: number;
  blocked_since: string | null;
  updated_at: string;
}

export async function GET() {
  const statusUrl = process.env.FREIGHT_STATUS_URL;

  // If worker isn't configured, return empty — UI shows nothing rather than errors
  if (!statusUrl) {
    return NextResponse.json([] as FreightStatusRecord[]);
  }

  try {
    const res = await fetch(statusUrl, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`freight-status upstream error: ${res.status}`);
      return NextResponse.json([] as FreightStatusRecord[]);
    }

    const data: FreightStatusRecord[] = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("freight-status fetch error:", err);
    // Upstream unavailable — return empty, not an error response
    return NextResponse.json([] as FreightStatusRecord[]);
  }
}
