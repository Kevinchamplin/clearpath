// TODO: persist to MySQL on ce-prod or Vercel KV for durability

export const runtime = 'nodejs'

interface Report {
  id: string
  crossing: string
  railroad: string
  reported_at: string
  duration_minutes: number | null
  description: string
  reporter_name: string
  submitted_at: string
}

const reports: Report[] = []

export async function GET() {
  const newest = [...reports].reverse().slice(0, 50)
  return Response.json(newest)
}

export async function POST(request: Request) {
  let body: Partial<Report>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { crossing, railroad, reported_at, duration_minutes, description, reporter_name } = body as {
    crossing?: string
    railroad?: string
    reported_at?: string
    duration_minutes?: number | null
    description?: string
    reporter_name?: string
  }

  if (!crossing || !railroad || !reported_at) {
    return Response.json(
      { error: 'Missing required fields: crossing, railroad, reported_at' },
      { status: 422 }
    )
  }

  const report: Report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    crossing,
    railroad,
    reported_at,
    duration_minutes: duration_minutes ?? null,
    description: description ?? '',
    reporter_name: reporter_name ?? '',
    submitted_at: new Date().toISOString(),
  }

  reports.push(report)

  return Response.json(report, { status: 201 })
}
