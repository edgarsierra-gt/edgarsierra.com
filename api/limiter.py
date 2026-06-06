from fastapi import Request
from slowapi import Limiter


def get_real_ip(request: Request) -> str:
    # Cloud Run sits behind Google's LB; real IP is in X-Forwarded-For
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host or "unknown"  # type: ignore[union-attr]


limiter = Limiter(key_func=get_real_ip)
