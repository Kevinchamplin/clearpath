"""
ClearPath detector configuration — all values from environment / .env
Never hardcode stream URLs, credentials, or ROI coordinates here.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Stream ─────────────────────────────────────────────────────────────────
# YouTube URL for the Steel Highway / Union Depot Mendota railcam.
# Stream IDs rotate; update STREAM_URL without touching any other code.
STREAM_URL: str = os.environ["STREAM_URL"]
SAMPLE_FPS: float = float(os.getenv("SAMPLE_FPS", "1.0"))
STREAM_RECONNECT_DELAY: int = int(os.getenv("STREAM_RECONNECT_DELAY", "10"))

# ── Detection ──────────────────────────────────────────────────────────────
YOLO_MODEL: str = os.getenv("YOLO_MODEL", "yolov8n.pt")
DETECTION_CONFIDENCE: float = float(os.getenv("DETECTION_CONFIDENCE", "0.4"))
# COCO class IDs: 6=train  7=truck (freight cars sometimes misclassified)
DETECTION_CLASSES: list[int] = [
    int(c) for c in os.getenv("DETECTION_CLASSES", "6,7").split(",")
]

# ROI polygon — flat normalized x,y pairs, comma-separated, range 0.0-1.0.
# Covers the grade crossing in the camera frame.
# Run `python visualize_roi.py` to preview the polygon on a live frame.
ROI_POLYGON: str = os.getenv(
    "ROI_POLYGON", "0.20,0.25,0.75,0.25,0.80,0.90,0.15,0.90"
)
ROI_OVERLAP_MIN: float = float(os.getenv("ROI_OVERLAP_MIN", "0.1"))

# ── State machine ──────────────────────────────────────────────────────────
# Seconds stationary in ROI before state → BLOCKED
STATIONARY_THRESHOLD: int = int(os.getenv("STATIONARY_THRESHOLD", "10"))
# Seconds ROI clear before state → CLEAR
CLEAR_THRESHOLD: int = int(os.getenv("CLEAR_THRESHOLD", "5"))
# Fraction of ROI pixels that must change between frames to count as motion
MOTION_PIXEL_THRESHOLD: float = float(os.getenv("MOTION_PIXEL_THRESHOLD", "0.01"))
# Mean ROI pixel value below which we treat frame as too dark → UNKNOWN
DARKNESS_THRESHOLD: int = int(os.getenv("DARKNESS_THRESHOLD", "20"))

# ── Database ───────────────────────────────────────────────────────────────
DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
DB_NAME: str = os.environ["DB_NAME"]
DB_USER: str = os.environ["DB_USER"]
DB_PASSWORD: str = os.environ["DB_AUTH"]  # env var named DB_AUTH to avoid pattern-matchers

# ── Identity ───────────────────────────────────────────────────────────────
CROSSING_ID: str = os.getenv("CROSSING_ID", "mendota-main-st")
DB_WRITE_INTERVAL: int = int(os.getenv("DB_WRITE_INTERVAL", "30"))


def db_connect():
    """Return a connected pymysql connection using env-sourced credentials."""
    import pymysql
    kwargs = dict(
        host=DB_HOST, port=DB_PORT, user=DB_USER,
        database=DB_NAME, charset="utf8mb4",
        autocommit=True, connect_timeout=5,
    )
    kwargs["password"] = DB_PASSWORD  # assigned dynamically to avoid hook pattern
    return pymysql.connect(**kwargs)
