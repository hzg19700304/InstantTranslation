# @AI-Generated
"""
FastAPI 入口
"""
from fastapi import FastAPI
from app.api import translation, translation_router, completeness_router
from app.middleware.rate_limit import RateLimiter

app = FastAPI(title="AI Translation Server")
app.add_middleware(RateLimiter, max_requests=2, window_seconds=2)  # 2秒内最多2次

# 注册路由
app.include_router(translation.router, prefix="/api/translation", tags=["Translation"])
app.include_router(translation_router, prefix="/api/translation")
app.include_router(completeness_router, prefix="/api/translation/completeness") 