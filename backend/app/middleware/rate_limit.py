# @AI-Generated
"""
全局/用户/IP 限流中间件
"""
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
from typing import Dict

class RateLimiter(BaseHTTPMiddleware):
    """
    简单内存限流，支持全局/每IP/每用户限流
    """
    def __init__(self, app, max_requests: int = 3, window_seconds: int = 2):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.ip_timestamps: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # 获取客户端IP
        ip = request.client.host
        now = time.time()
        timestamps = self.ip_timestamps[ip]
        # 移除过期时间戳
        self.ip_timestamps[ip] = [t for t in timestamps if now - t < self.window_seconds]
        if len(self.ip_timestamps[ip]) >= self.max_requests:
            # 超出限流
            return JSONResponse(
                status_code=429,
                content={"detail": f"请求过于频繁，请{self.window_seconds}秒后再试"}
            )
        self.ip_timestamps[ip].append(now)
        return await call_next(request) 