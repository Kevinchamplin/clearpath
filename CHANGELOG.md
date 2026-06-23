# Changelog

## [Unreleased]

### Changed (2026-06-23, world-class-safety-ui) [3h]
- globals.css — complete safety-first design system: 16px base, `--clear`/`--approaching`/`--blocked` tokens, card-panel crossings with shadow, shimmer skeleton animation, `100dvh` layout, mobile `flex-direction: column-reverse` puts status cards ABOVE map
- CrossingStatus.tsx — status pill (CLEAR / IN X MIN / BLOCKED) answers "can I cross?" at a glance; big 18px tabular ETA numbers; MAX_ETA_MIN=480 filter (no 6000-min trains); .slice(0,3) cap; nextStation null guard; freight badge via CSS classes
- amtrak.ts — `nextStation` parsing from `stations[]` array (first non-departed station); `TrainPosition.nextStation` typed with `code/name/schArr`
- Nav.tsx + layout.tsx — `MobileBottomNav` (Map/Report/Dispatch/Info fixed bottom bar with safe-area inset); `dispatch-mode` body class CSS rule
- dispatch/page.tsx + dispatch.module.css — full-screen overlay (z-index 1001, covers global nav + bottom nav); SSE stream with shimmer skeleton loading; live clock; CLEAR (dark green) / ALERT (amber/red pulsing) card variants; 2→1 col responsive grid
- about/page.tsx — dark hero with May 28 BNSF incident card, 4h blockage stat, Fire Chief Rutishauser + 3 regional chief quotes, feature cards, OSS section, builder card
- how-it-works/page.tsx — numbered data-flow timeline (Amtrak→Haversine→SSE→screen), freight detection gap section, data freshness table, FAQ cards
- report/page.tsx — BNSF emergency bar at top, 44px+ touch targets, 52px submit button, success state, recent reports list
- corridor/page.tsx — town grid (Mendota highlighted), ~25% delay stat, shared problem narrative, Fork ClearPath dark card with GitHub CTA

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
