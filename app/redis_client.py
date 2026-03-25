import json
from decimal import Decimal
from dotenv import load_dotenv
import os

load_dotenv()

# ─────────────────────────────────────────────
# Redis is OPTIONAL — graceful no-op if not configured
# ─────────────────────────────────────────────
_redis_url = os.getenv("UPSTASH_REDIS_REST_URL", "")
_redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")

redis = None
if _redis_url and _redis_token:
    try:
        from upstash_redis import Redis
        redis = Redis(url=_redis_url, token=_redis_token)
        print("[Redis] Connected to Upstash Redis")
    except Exception as e:
        print(f"[Redis] Failed to connect — running without cache: {e}")
else:
    print("[Redis] No Redis configured — caching disabled (this is fine for local dev)")


# ─────────────────────────────────────────────
# Cache key constants — one place to manage all keys
# ─────────────────────────────────────────────
CACHE_KEYS = {
    "products_list": "products:list",           # all products listing
    "product_slug":  "products:slug:{}",        # single product by slug
    "user_distance": "dist:{}",                 # distance calcs per user_id
}

CACHE_TTL = {
    "products_list": 60 * 5,    # 5 minutes
    "product_slug":  60 * 10,   # 10 minutes
    "user_distance": 60 * 60,   # 1 hour
}


# ─────────────────────────────────────────────
# Custom JSON encoder — handles Decimal, datetime
# SQLAlchemy models return Decimal for Numeric fields
# ─────────────────────────────────────────────
class AppJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        from datetime import datetime
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def to_json(data) -> str:
    """Serialize data to JSON string safely"""
    return json.dumps(data, cls=AppJSONEncoder)


def from_json(data: str):
    """Deserialize JSON string back to Python object"""
    return json.loads(data)


# ─────────────────────────────────────────────
# Cache helpers — all become no-ops if redis is None or fails
# ─────────────────────────────────────────────
_redis_failed = False

def cache_set(key: str, value, ttl: int) -> None:
    """Store value in Redis with expiry"""
    global _redis_failed
    if not redis or _redis_failed:
        return
    try:
        redis.set(key, to_json(value), ex=ttl)
    except Exception as e:
        print(f"[Redis] cache_set failed for key={key}: {e}")
        _redis_failed = True


def cache_get(key: str):
    """Retrieve value from Redis — returns None on miss or error"""
    global _redis_failed
    if not redis or _redis_failed:
        return None
    try:
        data = redis.get(key)
        if data:
            return from_json(data)
        return None
    except Exception as e:
        print(f"[Redis] cache_get failed for key={key}: {e}")
        _redis_failed = True
        return None


def cache_delete(*keys: str) -> None:
    """Delete one or more keys from Redis"""
    global _redis_failed
    if not redis or _redis_failed:
        return
    try:
        for key in keys:
            redis.delete(key)
    except Exception as e:
        print(f"[Redis] cache_delete failed: {e}")
        _redis_failed = True


def invalidate_product_cache(slug: str = None) -> None:
    """
    Invalidates product caches after create/update/delete.
    Always clears the list. Clears slug cache if slug is provided.
    """
    keys_to_delete = [CACHE_KEYS["products_list"]]
    if slug:
        keys_to_delete.append(CACHE_KEYS["product_slug"].format(slug))
    cache_delete(*keys_to_delete)