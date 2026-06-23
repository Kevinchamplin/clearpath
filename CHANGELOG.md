# Changelog

## [Unreleased]

### Added (2026-06-23, freight-detection-worker) [2.5h]
- Python YOLO freight detection worker (worker/) — samples Steel Highway YouTube railcam at 1fps, detects trains via YOLOv8n, writes CLEAR/BLOCKED/UNKNOWN to MySQL
- MySQL clearpath DB on ce-prod with crossing_status table (migration + clearpath_user provisioned)
- PHP endpoint (clearpath-status.php on crm vhost) — reads crossing_status, serves JSON to Next.js
- Next.js /api/freight-status proxy route + 30s polling; camera-based freight badge per crossing in CrossingStatus
- Systemd service (clearpath-detector) on ce-prod — auto-restarts, MemoryMax=800M, enabled at boot
- Stream URL: https://www.youtube.com/watch?v=R4VPI-pSrlQ (Steel Highway Mendota railcam)
- All freight UI labeled "📷 camera inference — not authoritative dispatch data"

### Added (2026-06-23, sprint-5-community) [1h]
- Community blockage report form (/report) with BNSF and FRA contact info
- Illinois Valley corridor page (/corridor) with fork-for-your-town guide
- Press kit page (/press) for journalists and city officials

### Added (2026-06-23, sprint-4-data) [0.75h]
- Expanded watchTrains to include Illinois Service and Empire Builder trains
- Delay display, next station, viaduct note, and BNSF contact in CrossingStatus
- Fourth Ave viaduct clearance data and alternative route notes in town config

### Added (2026-06-23, sprint-3-dispatch) [0.75h]
- Dispatch view (/dispatch) — large-text tablet view, 15s auto-refresh
- Printable crossing map (/print) with FRA IDs, coordinates, emergency contacts

### Added (2026-06-23, sprint-2-realtime) [1h]
- SSE stream endpoint /api/trains/stream for push updates
- PWA manifest and service worker for home screen install
- Next station display on train cards

### Added (2026-06-23, sprint-1-content) [1h]
- About page with the Mendota story, BNSF incident, fire chief quotes
- How It Works page explaining Amtrak tracking and community reporting
- Nav component across all pages

### Added (2026-06-23, clearpath-init) [1.5h]
- Initial scaffold: Next.js 14 App Router + TypeScript + Leaflet
- `src/config/town.ts` — forkable town config with Mendota, IL grade crossings (FRA IDs, lat/lng)
- `src/lib/amtrak.ts` — Amtrak unofficial API client with AES-CBC decryption, haversine distance, and ETA calculator
- `src/app/api/trains/route.ts` — edge API route proxying Amtrak data, enriching each train with per-crossing ETAs
- `src/components/TrainMap.tsx` — Leaflet map (client-only) with train markers, crossing markers, and ETA popups
- `src/components/CrossingStatus.tsx` — sidebar panel showing approaching trains per crossing with color-coded alerts
- `src/app/page.tsx` — main dashboard with 60s auto-refresh and red alert banner when a train is within 20 min of any crossing
- Deployed to `clearpath.champlinenterprises.com` via Vercel
