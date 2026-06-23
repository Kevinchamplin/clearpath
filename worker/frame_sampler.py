"""
Frame sampler — resolves a YouTube live stream via yt-dlp, then pulls
frames at the configured FPS via ffmpeg. Yields numpy BGR arrays or None.

None means the stream is unavailable — caller must emit UNKNOWN.
"""
import subprocess
import numpy as np
import logging
import time
from typing import Generator, Optional

import config

log = logging.getLogger(__name__)


def _resolve_stream_url(youtube_url: str) -> Optional[str]:
    """Call yt-dlp to get the best direct stream URL (max 720p)."""
    try:
        result = subprocess.run(
            [
                "yt-dlp", "-g", "--no-playlist",
                "-f", "best[height<=720]/best",
                youtube_url,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            log.error("yt-dlp failed (rc=%d): %s", result.returncode, result.stderr[:200])
            return None
        urls = [u.strip() for u in result.stdout.strip().split("\n") if u.strip()]
        return urls[0] if urls else None
    except Exception as exc:
        log.error("yt-dlp exception: %s", exc)
        return None


def _probe_dimensions(url: str) -> Optional[tuple[int, int]]:
    """Return (width, height) of the video stream, or None on failure."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=p=0",
                url,
            ],
            capture_output=True, text=True, timeout=15,
        )
        parts = result.stdout.strip().split(",")
        if len(parts) == 2:
            return int(parts[0]), int(parts[1])
    except Exception as exc:
        log.error("ffprobe exception: %s", exc)
    return None


def sample_frames() -> Generator[Optional[np.ndarray], None, None]:
    """
    Infinite generator. Yields:
      - numpy (H, W, 3) BGR uint8 array  — valid frame
      - None                              — stream unavailable / error

    Reconnects automatically on stream failure.
    """
    while True:
        direct_url = _resolve_stream_url(config.STREAM_URL)
        if not direct_url:
            log.warning("Stream URL could not be resolved — yielding None")
            yield None
            time.sleep(config.STREAM_RECONNECT_DELAY)
            continue

        dims = _probe_dimensions(direct_url)
        if dims is None:
            log.warning("Could not probe stream dimensions — yielding None")
            yield None
            time.sleep(config.STREAM_RECONNECT_DELAY)
            continue

        width, height = dims
        frame_bytes = width * height * 3  # BGR24

        log.info("Stream ready: %dx%d @ %.1f fps", width, height, config.SAMPLE_FPS)

        cmd = [
            "ffmpeg",
            "-loglevel", "error",
            "-i", direct_url,
            "-vf", f"fps={config.SAMPLE_FPS}",
            "-f", "rawvideo",
            "-pix_fmt", "bgr24",
            "pipe:1",
        ]

        proc: Optional[subprocess.Popen] = None
        try:
            proc = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
            )
            while True:
                raw = proc.stdout.read(frame_bytes)  # type: ignore[union-attr]
                if len(raw) < frame_bytes:
                    log.warning("ffmpeg stream ended (got %d / %d bytes)", len(raw), frame_bytes)
                    break
                frame = np.frombuffer(raw, dtype=np.uint8).reshape((height, width, 3))
                yield frame
        except Exception as exc:
            log.error("ffmpeg pipe error: %s", exc)
        finally:
            if proc is not None:
                try:
                    proc.terminate()
                    proc.wait(timeout=5)
                except Exception:
                    pass

        yield None
        log.info("Reconnecting in %ds…", config.STREAM_RECONNECT_DELAY)
        time.sleep(config.STREAM_RECONNECT_DELAY)
