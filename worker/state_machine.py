"""
Crossing blockage state machine.

Public states: CLEAR | BLOCKED | UNKNOWN

Internal states:
  UNKNOWN   — initial / stream error / low confidence / dark frame
  CLEAR     — no train in ROI, confirmed for CLEAR_THRESHOLD seconds
  DETECTED  — train seen, not yet confirmed stationary
  BLOCKED   — train stationary for >= STATIONARY_THRESHOLD seconds
  CLEARING  — train gone or moving; waiting CLEAR_THRESHOLD to confirm CLEAR

Fail-safe rule: any None input (error) → UNKNOWN immediately.
Never default to CLEAR on ambiguity.
"""
import logging
import time
from dataclasses import dataclass
from enum import Enum
from typing import Optional

import config

log = logging.getLogger(__name__)


class CrossingState(str, Enum):
    UNKNOWN = "UNKNOWN"
    CLEAR = "CLEAR"
    BLOCKED = "BLOCKED"


@dataclass
class StateMachineOutput:
    state: CrossingState
    confidence: float
    blocked_since: Optional[float]  # Unix timestamp, or None


class _S(str, Enum):
    UNKNOWN = "UNKNOWN"
    CLEAR = "CLEAR"
    DETECTED = "DETECTED"
    BLOCKED = "BLOCKED"
    CLEARING = "CLEARING"


class CrossingStateMachine:
    def __init__(self) -> None:
        self._state = _S.UNKNOWN
        self._entered = time.monotonic()
        self._blocked_since: Optional[float] = None

    # ── Public ──────────────────────────────────────────────────────────────

    def update(
        self,
        detected: Optional[bool],
        confidence: float,
        moving: bool,
    ) -> StateMachineOutput:
        """
        detected: True = train in ROI, False = no train, None = error/dark/stream-down
        confidence: YOLO confidence of best in-ROI detection (0-1)
        moving: True if frame diff shows the object is moving
        """
        # Fail safe: any unknown input → UNKNOWN immediately
        if detected is None:
            self._set(_S.UNKNOWN)
            return self._out(0.0)

        elapsed = time.monotonic() - self._entered

        if self._state == _S.UNKNOWN:
            if detected:
                self._set(_S.DETECTED)
            elif elapsed >= config.CLEAR_THRESHOLD:
                self._set(_S.CLEAR)

        elif self._state == _S.CLEAR:
            if detected:
                self._set(_S.DETECTED)

        elif self._state == _S.DETECTED:
            if not detected:
                self._set(_S.CLEARING)
            elif moving:
                # Still moving — reset stationary timer
                self._entered = time.monotonic()
            elif elapsed >= config.STATIONARY_THRESHOLD:
                self._blocked_since = time.time()
                self._set(_S.BLOCKED)

        elif self._state == _S.BLOCKED:
            if not detected or moving:
                self._set(_S.CLEARING)

        elif self._state == _S.CLEARING:
            if detected and not moving:
                # Stopped again while we were clearing
                if self._blocked_since is None:
                    self._blocked_since = time.time()
                self._set(_S.BLOCKED)
            elif not detected and elapsed >= config.CLEAR_THRESHOLD:
                self._blocked_since = None
                self._set(_S.CLEAR)

        return self._out(confidence)

    # ── Private ─────────────────────────────────────────────────────────────

    def _set(self, new: _S) -> None:
        if new != self._state:
            log.info("Crossing state: %s → %s", self._state.value, new.value)
            self._state = new
            self._entered = time.monotonic()

    def _out(self, confidence: float) -> StateMachineOutput:
        public = {
            _S.BLOCKED: CrossingState.BLOCKED,
            _S.CLEAR: CrossingState.CLEAR,
        }.get(self._state, CrossingState.UNKNOWN)
        return StateMachineOutput(
            state=public,
            confidence=confidence,
            blocked_since=self._blocked_since,
        )
