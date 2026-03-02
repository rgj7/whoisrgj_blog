from fastapi import Request
from slowapi import Limiter


def real_ip_key(request: Request) -> str:
    x_real_ip = request.headers.get("X-Real-IP")
    if x_real_ip:
        return x_real_ip
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=real_ip_key, default_limits=["60/minute"])
