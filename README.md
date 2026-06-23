# ClearPath

Real-time Amtrak train position monitor for grade crossings — built for first responders and communities living along busy rail corridors.

**Live demo:** [clearpath.champlinenterprises.com](https://clearpath.champlinenterprises.com)

Built for Mendota, IL (California Zephyr corridor). **Fork it for your town in 5 minutes.**

---

## What it does

- Shows live Amtrak train positions on a map centered on your town
- Marks every grade crossing with its FRA crossing ID
- Calculates ETA to each crossing for every nearby train
- Flashes a red alert banner when a train is within 20 minutes of any crossing
- Auto-refreshes every 60 seconds — no page reload needed
- Mobile-friendly for dispatch tablets and phones

## Why

Long trains blocking grade crossings delay first responders. This is a real public safety problem in small towns on freight mainlines. ClearPath gives dispatchers and firefighters a 10–20 minute heads-up to route around blocked crossings.

> **Note:** This tool tracks **Amtrak trains only** — freight train positions are not publicly available. The California Zephyr (trains #5 and #6) runs through Mendota daily.

## Fork for your town

1. Clone the repo
2. Edit `src/config/town.ts`:
   - Set your town's name, center lat/lng, and zoom level
   - Add your grade crossings (get FRA IDs from the [FRA crossing inventory](https://railroads.dot.gov/))
   - Set `watchTrains` to the Amtrak train numbers that pass through
3. Deploy to Vercel (free tier)

That's it.

## Stack

- Next.js 14 (App Router) + TypeScript
- Leaflet / react-leaflet for maps
- Amtrak's unofficial public map API
- Vercel (free tier deployment)
- No database, no auth, no backend

## Run locally

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Deploy

```bash
vercel --prod
```

## License

MIT — free forever. Fork it, deploy it, share it.

Built by [Kevin Champlin](https://champlinenterprises.com) · Mendota, IL
