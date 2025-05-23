# @AI-Generated
"""
Google Speech-to-Text 语音识别服务
"""
from google.cloud import speech_v1p1beta1 as speech
import json
from fastapi import UploadFile
from typing import Optional, Tuple
from .ai_base import Optional as BaseOptional

async def speech_to_text_google(audio: UploadFile, api_key: str) -> Tuple[str, Optional[float]]:
    content = await audio.read()
    client = speech.SpeechClient.from_service_account_info(json.loads(api_key))
    audio_config = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="zh-CN"
    )
    response = client.recognize(config=config, audio=audio_config)
    if not response.results:
        return "", None
    result = response.results[0]
    return result.alternatives[0].transcript, result.alternatives[0].confidence 