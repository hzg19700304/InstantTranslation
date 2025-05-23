# @AI-Generated
"""
OpenAI Whisper 语音识别服务
"""
import aiofiles
import os
import httpx
from fastapi import UploadFile
from typing import Optional, Tuple
from .ai_base import Optional as BaseOptional
import time

async def speech_to_text_openai(audio: UploadFile, api_key: str) -> Tuple[str, Optional[float]]:
    temp_path = f"/tmp/{audio.filename}"
    async with aiofiles.open(temp_path, 'wb') as out_file:
        content = await audio.read()
        await out_file.write(content)
    headers = {"Authorization": f"Bearer {api_key}"}
    files = {'file': (audio.filename, open(temp_path, 'rb'), audio.content_type)}
    data = {'model': 'whisper-1'}
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, data=data, files=files, timeout=60)
    duration = time.time() - start
    print(f"[LLM耗时] provider=openai, 接口=audio_transcriptions, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        os.remove(temp_path)
        raise Exception(f"OpenAI Whisper API错误: {resp.status_code}")
    result = resp.json()
    os.remove(temp_path)
    return result.get('text', ''), None 