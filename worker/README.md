# ClearPath Detection Worker

Python service that monitors a public railcam, detects freight trains at the
Mendota grade crossing using YOLO, and writes state to MySQL so the ClearPath
web app can display a live freight status badge.

**State machine outputs:** `CLEAR` | `BLOCKED` | `UNKNOWN`

Fail-safe: any error → `UNKNOWN`. Never defaults to `CLEAR`.

---

## Architecture

```
YouTube railcam (Steel Highway)
    ↓  yt-dlp resolves stream URL
    ↓  ffmpeg samples frames @ SAMPLE_FPS
    ↓
YOLO (yolov8n) detects trains in ROI polygon
    ↓
Frame diff classifies moving vs. stationary
    ↓
State machine: CLEAR / DETECTED / BLOCKED / CLEARING / UNKNOWN
    ↓
MySQL crossing_status table (ce-prod local)
    ↓
PHP API endpoint (ce-prod) → Next.js /api/freight-status → UI badge
```

---

## Prerequisites (ce-prod)

```bash
# System packages
sudo yum install -y ffmpeg python3 python3-pip
pip3 install yt-dlp   # or: sudo pip3 install yt-dlp

# Python deps
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# YOLO model downloads automatically (~6MB) on first run
```

---

## Setup

### 1. Database

Run the migration on ce-prod MySQL:

```bash
mysql -u root -p < migrations/001_crossing_status.sql
# Or: mysql -h 127.0.0.1 -u clearpath_user -p clearpath < migrations/001_crossing_status.sql
```

### 2. Environment

```bash
cp .env.example .env
nano .env
```

Fill in:
- `STREAM_URL` — current Steel Highway YouTube URL (see below)
- `DB_NAME`, `DB_USER`, `DB_AUTH` — MySQL credentials
- `ROI_POLYGON` — see ROI calibration below

### 3. Find the stream URL

1. Visit [youtube.steel-highway.com](https://youtube.steel-highway.com)
   or check the [Union Depot Railroad Museum](https://www.mendotarailroadmuseum.org/) links
2. Find the live stream covering the Mendota BNSF crossing
3. Copy the YouTube URL into `STREAM_URL` in `.env`
4. Stream IDs rotate — if the worker starts emitting UNKNOWN continuously, check if
   the stream URL has changed

### 4. Calibrate the ROI

The ROI polygon defines which area of the camera frame contains the grade crossing.
Coordinates are normalized (0.0–1.0), so they work regardless of stream resolution.

```bash
source venv/bin/activate
python visualize_roi.py       # saves roi_preview.jpg
# Open roi_preview.jpg and check the green overlay covers the crossing
# Adjust ROI_POLYGON in .env and repeat until it looks right
```

ROI format: `x1,y1,x2,y2,x3,y3,x4,y4` (clockwise from top-left, 0.0–1.0)

### 5. Test run

```bash
source venv/bin/activate
python detector.py
# Watch the logs — you should see state transitions as trains pass
# Check MySQL: SELECT * FROM crossing_status;
```

---

## Deploy (systemd)

```bash
# Copy files to ce-prod
rsync -av --exclude='venv/' --exclude='.env' . champline@815hosting.com:~/clearpath-worker/

# On ce-prod: create venv and install deps
ssh ce-prod "cd ~/clearpath-worker && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"

# Copy .env (never commit it)
scp .env champline@815hosting.com:~/clearpath-worker/.env

# Install systemd service
sudo cp clearpath-detector.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable clearpath-detector
sudo systemctl start clearpath-detector

# Monitor
journalctl -u clearpath-detector -f
```

---

## PHP API endpoint

Deploy `api/status.php` on ce-prod so the Next.js app can read crossing status:

```bash
# Copy to the WP/crm docroot (publicly accessible)
scp api/status.php champline@815hosting.com:/var/www/vhosts/champlinenterprises.com/crm.ChamplinEnterprises.com/clearpath-status.php
```

Set the PHP env vars in Plesk (PHP Settings → Environment Variables) for the domain:
```
CLEARPATH_DB_HOST=127.0.0.1
CLEARPATH_DB_NAME=clearpath
CLEARPATH_DB_USER=clearpath_user
CLEARPATH_DB_AUTH=your_db_auth_value
```

Then set in Vercel dashboard:
```
FREIGHT_STATUS_URL=https://crm.champlinenterprises.com/clearpath-status.php
```

---

## State machine

| State | Meaning |
|---|---|
| `UNKNOWN` | Initial / stream error / dark frame / low confidence |
| `CLEAR` | No train in ROI for ≥ `CLEAR_THRESHOLD` seconds |
| `BLOCKED` | Train stationary in ROI for ≥ `STATIONARY_THRESHOLD` seconds |

Moving trains (passing through) stay in the internal `DETECTED` state and never
emit `BLOCKED` — only trains that **stop** at the crossing become `BLOCKED`.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Constant `UNKNOWN` | Stream URL changed — update `STREAM_URL` |
| Constant `UNKNOWN` after dark | `DARKNESS_THRESHOLD` too high — lower it or set it to 0 to disable |
| Never `BLOCKED` even with stopped train | ROI not covering crossing — run `visualize_roi.py` and adjust |
| False `BLOCKED` on passing trains | Lower `STATIONARY_THRESHOLD` — or widen `CLEAR_THRESHOLD` |
| DB write errors | Check MySQL credentials in `.env` and that the DB exists |
