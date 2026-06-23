#!/usr/bin/env python3
"""
ClearPath Freight Detection Worker

Samples a public railcam (YouTube live stream), detects trains in a
configurable ROI using YOLO, classifies moving vs stopped, and writes
crossing state to MySQL every SAMPLE_FPS seconds.

Fail-safe: any error emits UNKNOWN. Never defaults to CLEAR.

Usage:
    cp .env.example .env   # fill in STREAM_URL, DB_*, ROI_POLYGON
    python detector.py

See README.md for setup, ROI calibration, and systemd deploy.
"""
import logging
import sys
import time

import config
import db
from frame_sampler import sample_frames
from model import detect, parse_roi
from motion import MotionDetector
from state_machine import CrossingStateMachine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("clearpath.detector")


def main() -> None:
    log.info("Starting ClearPath detector (crossing=%s)", config.CROSSING_ID)

    # Emit UNKNOWN immediately so the UI never shows stale CLEAR on startup
    db.write_status(config.CROSSING_ID, "UNKNOWN", 0.0, None)

    fsm = CrossingStateMachine()
    motion = MotionDetector(buffer_size=5)
    last_db_write = 0.0
    last_state = "UNKNOWN"

    try:
        for frame in sample_frames():
            try:
                if frame is None:
                    output = fsm.update(detected=None, confidence=0.0, moving=False)
                    motion.reset()
                else:
                    detection = detect(frame)

                    if detection is None:
                        output = fsm.update(detected=None, confidence=0.0, moving=False)
                    else:
                        h, w = frame.shape[:2]
                        roi_pts = parse_roi(h, w)
                        is_moving = motion.update(frame, roi_pts) if detection.detected else False
                        output = fsm.update(
                            detected=detection.detected,
                            confidence=detection.confidence,
                            moving=is_moving,
                        )

                now = time.time()
                state_str = output.state.value
                state_changed = state_str != last_state
                interval_elapsed = now - last_db_write >= config.DB_WRITE_INTERVAL

                if state_changed or interval_elapsed:
                    db.write_status(
                        crossing_id=config.CROSSING_ID,
                        state=state_str,
                        confidence=output.confidence,
                        blocked_since=output.blocked_since,
                    )
                    last_db_write = now
                    last_state = state_str

                    if state_changed:
                        log.info(
                            "Crossing %s: %s (confidence=%.0f%%)",
                            config.CROSSING_ID,
                            state_str,
                            output.confidence * 100,
                        )

            except Exception as exc:
                log.error("Frame processing error: %s", exc)
                # Fail safe
                fsm.update(detected=None, confidence=0.0, moving=False)
                db.write_status(config.CROSSING_ID, "UNKNOWN", 0.0, None)

    except KeyboardInterrupt:
        log.info("Detector stopped (KeyboardInterrupt)")
    except Exception as exc:
        log.critical("Fatal error: %s", exc)
        db.write_status(config.CROSSING_ID, "UNKNOWN", 0.0, None)
        sys.exit(1)
    finally:
        db.write_status(config.CROSSING_ID, "UNKNOWN", 0.0, None)
        log.info("Detector shut down — wrote UNKNOWN on exit")


if __name__ == "__main__":
    main()
