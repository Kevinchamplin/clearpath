#!/usr/bin/env python3
"""
ROI calibration helper.

Grabs one frame from the live stream and overlays the configured ROI polygon
so you can verify it covers the grade crossing correctly.

Usage:
    python visualize_roi.py            # saves roi_preview.jpg and opens it
    python visualize_roi.py --show     # also calls cv2.imshow (needs display)
"""
import argparse
import sys

import cv2
import numpy as np

import config
from frame_sampler import _resolve_stream_url, _probe_dimensions
from model import parse_roi


def grab_frame():
    """Grab a single frame from the configured stream."""
    import subprocess

    url = _resolve_stream_url(config.STREAM_URL)
    if not url:
        print("ERROR: could not resolve stream URL. Check STREAM_URL in .env")
        sys.exit(1)

    dims = _probe_dimensions(url)
    if not dims:
        print("ERROR: could not probe stream dimensions")
        sys.exit(1)

    width, height = dims
    frame_bytes = width * height * 3

    cmd = [
        "ffmpeg", "-loglevel", "error",
        "-i", url,
        "-frames:v", "1",
        "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1",
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=30)
    if len(result.stdout) < frame_bytes:
        print("ERROR: could not grab frame from stream")
        sys.exit(1)

    return np.frombuffer(result.stdout[:frame_bytes], dtype=np.uint8).reshape((height, width, 3))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--show", action="store_true", help="Open cv2.imshow window")
    args = parser.parse_args()

    print(f"Grabbing frame from stream: {config.STREAM_URL}")
    frame = grab_frame()
    h, w = frame.shape[:2]
    roi_pts = parse_roi(h, w)

    overlay = frame.copy()

    # Fill ROI with semi-transparent green
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [roi_pts], 255)
    green = np.zeros_like(overlay)
    green[:] = (0, 200, 0)
    overlay = np.where(mask[:, :, None] > 0, cv2.addWeighted(overlay, 0.6, green, 0.4, 0), overlay)

    # Draw ROI outline
    cv2.polylines(overlay, [roi_pts], isClosed=True, color=(0, 255, 0), thickness=3)

    # Annotate vertices
    for i, (x, y) in enumerate(roi_pts):
        cv2.circle(overlay, (x, y), 6, (0, 0, 255), -1)
        cv2.putText(overlay, f"P{i} ({x},{y})", (x + 8, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    cv2.putText(overlay, f"ROI: {config.ROI_POLYGON}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    cv2.putText(overlay, "Green = crossing region", (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    out_path = "roi_preview.jpg"
    cv2.imwrite(out_path, overlay)
    print(f"Saved: {out_path}")

    if args.show:
        cv2.imshow("ROI Preview — press any key to close", overlay)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
