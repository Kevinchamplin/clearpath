export const runtime = "nodejs";

const REPORTS_URL = process.env.REPORTS_URL; // https://crm.champlinenterprises.com/clearpath-reports.php

export async function GET() {
  if (!REPORTS_URL) return Response.json([]);
  try {
    const res = await fetch(REPORTS_URL, { next: { revalidate: 30 } });
    if (!res.ok) return Response.json([]);
    return Response.json(await res.json());
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: Request) {
  if (!REPORTS_URL) {
    return Response.json({ error: "Reports endpoint not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await fetch(REPORTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Reports service unavailable" }, { status: 502 });
  }
}
