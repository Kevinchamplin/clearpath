"""
Frame-to-frame motion detector within the ROI.
Used to distinguish stopped trains (→ BLOCKED) from passing trains (→ DETECTED).
"""
from collections import deque

import cv2
import numpy as np

import config


class MotionDetector:
    """Maintains a rolling buffer of ROI-masked grayscale frames."""

    def __init__(self, buffer_size: int = 5) -> None:
        self._buffer: deque[np.ndarray] = deque(maxlen=buffer_size)

    def update(self, frame: np.ndarray, roi_pts: np.ndarray) -> bool:
        """
        Returns True if motion is detected in the ROI (train is moving).
        Returns False if no meaningful motion (train is stationary or absent).
        """
        h, w = frame.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(mask, [roi_pts], 255)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        roi_gray = cv2.bitwise_and(gray, gray, mask=mask)
        self._buffer.append(roi_gray)

        if len(self._buffer) < 2:
            return False  # need at least two frames

        prev = self._buffer[-2]
        curr = self._buffer[-1]

        diff = cv2.absdiff(prev, curr)
        roi_area = float(np.sum(mask > 0))
        if roi_area == 0:
            return False

        # Count pixels that changed by more than a small threshold (noise filter)
        changed = float(np.sum(diff > 15))
        return (changed / roi_area) > config.MOTION_PIXEL_THRESHOLD

    def reset(self) -> None:
        self._buffer.clear()
