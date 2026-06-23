"""
MySQL persistence for crossing_status.
Single-row UPSERT per crossing_id. Retries 3× on transient errors.
Connection is created via config.db_connect() which reads credentials from env.
"""
import logging
import time
from datetime import datetime
from typing import Optional

import config

log = logging.getLogger(__name__)


def write_status(
    crossing_id: str,
    state: str,
    confidence: float,
    blocked_since: Optional[float],
) -> None:
    """UPSERT crossing status. On repeated failure data stays stale — never clears."""
    blocked_dt = datetime.fromtimestamp(blocked_since) if blocked_since else None

    for attempt in range(1, 4):
        try:
            conn = config.db_connect()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO crossing_status
                        (crossing_id, state, confidence, blocked_since, updated_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                        state         = VALUES(state),
                        confidence    = VALUES(confidence),
                        blocked_since = VALUES(blocked_since),
                        updated_at    = NOW()
                    """,
                    (crossing_id, state, round(confidence, 4), blocked_dt),
                )
            conn.close()
            log.debug("DB write OK: %s → %s (conf=%.2f)", crossing_id, state, confidence)
            return
        except Exception as exc:
            log.error("DB write error (attempt %d/3): %s", attempt, exc)
            time.sleep(attempt)

    log.error("DB write failed after 3 attempts — crossing_status will be stale, not CLEAR")
