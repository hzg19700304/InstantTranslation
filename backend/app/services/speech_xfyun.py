# @AI-Generated
"""
讯飞语音识别服务
"""
import httpx
import hashlib
import base64
import time
import hmac
import json
from fastapi import UploadFile
from typing import Optional, Tuple

async def speech_to_text_xfyun(audio: UploadFile, app_id: str, api_key: str, api_secret: str) -> Tuple[str, Optional[float]]:
    url = "https://iat-api.xfyun.cn/v2/iat"
    ts = str(int(time.time()))
    body = await audio.read()
    body_base64 = base64.b64encode(body).decode()
    param = base64.b64encode(json.dumps({
        "engine_type": "sms16k",
        "aue": "raw",
        "language": "zh_cn"
    }).encode()).decode()
    checksum = hashlib.md5((api_key + ts).encode()).hexdigest()
    signa = base64.b64encode(hmac.new(api_secret.encode(), (app_id + ts).encode(), hashlib.sha1).digest()).decode()
    headers = {
        "X-Appid": app_id,
        "X-CurTime": ts,
        "X-Param": param,
        "X-CheckSum": checksum,
        "X-Signa": signa,
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
    data = {"audio": body_base64}
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, data=data, timeout=60)
    duration = time.time() - start
    print(f"[LLM耗时] provider=xfyun, 接口=iat-api, 耗时: {duration:.2f}秒")
    result = resp.json()
    if result.get("code") != "0":
        raise Exception(f"讯飞API错误: {result.get('desc')}")
    return result["data"], None 