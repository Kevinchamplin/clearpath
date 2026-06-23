-- ClearPath crossing_status table
-- Run once on the shared MySQL instance (ce-prod).
-- The Python detector does UPSERT; the PHP API reads this table.

CREATE TABLE IF NOT EXISTS crossing_status (
  crossing_id   VARCHAR(32)                          NOT NULL,
  state         ENUM('CLEAR','BLOCKED','UNKNOWN')    NOT NULL DEFAULT 'UNKNOWN',
  confidence    FLOAT                                NOT NULL DEFAULT 0.0,
  blocked_since DATETIME                             NULL,
  updated_at    DATETIME                             NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (crossing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed a row for the Mendota Main St crossing so the UI shows UNKNOWN immediately
-- (rather than 404 / empty on first load before the worker runs)
INSERT IGNORE INTO crossing_status (crossing_id, state, confidence)
VALUES ('mendota-main-st', 'UNKNOWN', 0.0);
