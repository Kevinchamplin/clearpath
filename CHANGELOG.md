# Changelog

## [Unreleased]

### Added (2026-06-23, clearpath-init) [1.5h]
- Initial scaffold: Next.js 14 App Router + TypeScript + Leaflet
- `src/config/town.ts` — forkable town config with Mendota, IL grade crossings (FRA IDs, lat/lng)
- `src/lib/amtrak.ts` — Amtrak unofficial API client with AES-CBC decryption, haversine distance, and ETA calculator
- `src/app/api/trains/route.ts` — edge API route proxying Amtrak data, enriching each train with per-crossing ETAs
- `src/components/TrainMap.tsx` — Leaflet map (client-only) with train markers, crossing markers, and ETA popups
- `src/components/CrossingStatus.tsx` — sidebar panel showing approaching trains per crossing with color-coded alerts
- `src/app/page.tsx` — main dashboard with 60s auto-refresh and red alert banner when a train is within 20 min of any crossing
- Deployed to `clearpath.champlinenterprises.com` via Vercel
