"""
YOLO-based train detector.

Uses YOLOv8n (pre-trained on COCO) to detect trains (class 6) and trucks
(class 7) inside the configured ROI polygon. Returns None on any error so
the caller can emit UNKNOWN.
"""
import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

import config

log = logging.getLogger(__name__)

_model = None  # lazy-loaded on first inference


def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO  # imported here to keep startup fast
        _model = YOLO(config.YOLO_MODEL)
        log.info("Loaded YOLO model: %s", config.YOLO_MODEL)
    return _model


def parse_roi(frame_h: int, frame_w: int) -> np.ndarray:
    """
    Parse ROI_POLYGON env var (flat normalized x,y pairs) into pixel coords.
    Returns an (N, 2) int32 array suitable for cv2.fillPoly.
    """
    vals = [float(v) for v in config.ROI_POLYGON.split(",")]
    pts = []
    for i in range(0, len(vals) - 1, 2):
        pts.append([int(vals[i] * frame_w), int(vals[i + 1] * frame_h)])
    return np.array(pts, dtype=np.int32)


def _roi_overlap(box_xyxy: list, roi_mask: np.ndarray) -> float:
    """
    Return what fraction of the detection bounding box overlaps with the ROI.
    roi_mask is a pre-built uint8 mask (255 inside ROI, 0 outside).
    """
    h, w = roi_mask.shape
    x1, y1, x2, y2 = (
        max(0, int(box_xyxy[0])),
        max(0, int(box_xyxy[1])),
        min(w, int(box_xyxy[2])),
        min(h, int(box_xyxy[3])),
    )
    box_area = max((x2 - x1) * (y2 - y1), 1)
    intersection = np.sum(roi_mask[y1:y2, x1:x2] > 0)
    return float(intersection) / box_area


@dataclass
class DetectionResult:
    detected: bool    # train present in ROI
    confidence: float # best model confidence of an in-ROI detection
    roi_overlap: float


def detect(frame: np.ndarray) -> Optional[DetectionResult]:
    """
    Run YOLO on frame, filter to ROI.
    Returns DetectionResult or None (caller → UNKNOWN).
    """
    try:
        h, w = frame.shape[:2]
        roi_pts = parse_roi(h, w)

        # Darkness check — if the ROI is too dark the cam is offline/night
        roi_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(roi_mask, [roi_pts], 255)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        roi_pixels = gray[roi_mask > 0]
        if roi_pixels.size > 0 and float(np.mean(roi_pixels)) < config.DARKNESS_THRESHOLD:
            log.debug("Frame too dark (mean=%.1f) — emitting None", float(np.mean(roi_pixels)))
            return None

        model = _get_model()
        results = model(
            frame,
            classes=config.DETECTION_CLASSES,
            conf=config.DETECTION_CONFIDENCE,
            verbose=False,
        )

        best_conf = 0.0
        best_overlap = 0.0
        detected = False

        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                conf = float(box.conf[0])
                overlap = _roi_overlap(box.xyxy[0].tolist(), roi_mask)
                if overlap >= config.ROI_OVERLAP_MIN:
                    detected = True
                    if conf > best_conf:
                        best_conf = conf
                        best_overlap = overlap

        return DetectionResult(detected=detected, confidence=best_conf, roi_overlap=best_overlap)

    except Exception as exc:
        log.error("Detection error: %s", exc)
        return None
