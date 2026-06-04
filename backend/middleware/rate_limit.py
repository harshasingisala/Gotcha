from collections import defaultdict, deque
from time import time
from flask import jsonify, request


_hits = defaultdict(deque)


LIMITS = (
    ("POST", "/api/items", 6, 60 * 60),
    ("POST", "/api/claims", 10, 60 * 60),
    ("POST", "/api/public/contact", 5, 60 * 60),
)


def _client_key():
    forwarded = request.headers.get("X-Forwarded-For", "")
    ip = forwarded.split(",", 1)[0].strip() or request.remote_addr or "unknown"
    auth = request.headers.get("Authorization", "")
    return auth[-24:] if auth.startswith("Bearer ") else ip


def rate_limit():
    for method, path, max_hits, window in LIMITS:
        if request.method != method or request.path != path:
            continue
        now = time()
        key = (method, path, _client_key())
        bucket = _hits[key]
        while bucket and bucket[0] <= now - window:
            bucket.popleft()
        if len(bucket) >= max_hits:
            retry_after = max(1, int(window - (now - bucket[0])))
            return jsonify({"error": "Too many attempts. Please wait before trying again."}), 429, {"Retry-After": str(retry_after)}
        bucket.append(now)
        return None
    return None
