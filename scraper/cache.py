"""
Global Data Security Observatory - File Cache
==============================================
A simple file-based cache that stores scraped data as JSON files in
the ``scraper/cache/`` directory.  Each entry is timestamped so stale
data can be automatically discarded after the configured TTL.
"""

import hashlib
import json
import logging
import os
import time
from typing import Any, Optional

from scraper.config import CACHE_DIR, CACHE_TTL

logger = logging.getLogger(__name__)


class FileCache:
    """Persist scraper results to JSON files with time-based expiration.

    Parameters
    ----------
    cache_dir : str, optional
        Directory where cache files are stored.  Defaults to
        ``scraper/cache/``.
    ttl : int, optional
        Time-to-live for cache entries in seconds.  Defaults to the
        value in ``config.CACHE_TTL`` (24 hours).
    """

    def __init__(
        self,
        cache_dir: str = CACHE_DIR,
        ttl: int = CACHE_TTL,
    ) -> None:
        self.cache_dir = cache_dir
        self.ttl = ttl
        # Ensure the cache directory exists
        os.makedirs(self.cache_dir, exist_ok=True)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _key_to_path(self, key: str) -> str:
        """Convert a cache key to a filesystem-safe path.

        We hash the key to avoid issues with special characters,
        length limits, or OS-specific path restrictions.
        """
        safe_name = hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]
        return os.path.join(self.cache_dir, f"{safe_name}.json")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached entry if it exists and has not expired.

        Parameters
        ----------
        key : str
            The cache key (typically a country code or URL).

        Returns
        -------
        Any or None
            The cached data, or ``None`` if the key is missing or stale.
        """
        path = self._key_to_path(key)
        if not os.path.exists(path):
            logger.debug("Cache MISS (no file): %s", key)
            return None

        try:
            with open(path, "r", encoding="utf-8") as fh:
                entry = json.load(fh)
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Cache read error for '%s': %s", key, exc)
            return None

        # Check TTL
        stored_at: float = entry.get("_cached_at", 0)
        age = time.time() - stored_at
        if age > self.ttl:
            logger.debug("Cache MISS (expired, age=%.0fs): %s", age, key)
            return None

        logger.debug("Cache HIT (age=%.0fs): %s", age, key)
        return entry.get("data")

    def set(self, key: str, data: Any) -> None:
        """Store data in the cache with the current timestamp.

        Parameters
        ----------
        key : str
            The cache key.
        data : Any
            JSON-serialisable data to cache.
        """
        path = self._key_to_path(key)
        entry = {
            "_cached_at": time.time(),
            "_key": key,
            "data": data,
        }
        try:
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(entry, fh, ensure_ascii=False, indent=2)
            logger.debug("Cache SET: %s -> %s", key, path)
        except OSError as exc:
            logger.warning("Cache write error for '%s': %s", key, exc)

    def clear(self) -> int:
        """Remove **all** cache files.

        Returns
        -------
        int
            Number of files deleted.
        """
        removed = 0
        if not os.path.isdir(self.cache_dir):
            return removed

        for filename in os.listdir(self.cache_dir):
            filepath = os.path.join(self.cache_dir, filename)
            if filepath.endswith(".json") and os.path.isfile(filepath):
                try:
                    os.remove(filepath)
                    removed += 1
                except OSError as exc:
                    logger.warning("Could not remove cache file %s: %s", filepath, exc)

        logger.info("Cache cleared – %d file(s) removed.", removed)
        return removed

