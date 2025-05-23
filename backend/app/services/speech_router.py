# @AI-Generated
"""
语音识别服务统一调度
"""
from fastapi import UploadFile
from typing import Optional, Tuple
from .speech_openai import speech_to_text_openai
from .speech_google import speech_to_text_google
from .speech_xfyun import speech_to_text_xfyun

async def speech_to_text_with_llm(
    audio: UploadFile,
    llm_provider: str,
    llm_api_key: str = None,
    xfyun_app_id: str = None,
    xfyun_api_key: str = None,
    xfyun_api_secret: str = None
) -> Tuple[str, Optional[float]]:
    """
    调用大模型或第三方API进行语音识别，支持 openai/google/xfyun
    """
    if llm_provider == "openai":
        return await speech_to_text_openai(audio, llm_api_key)
    elif llm_provider == "google":
        return await speech_to_text_google(audio, llm_api_key)
    elif llm_provider == "xfyun":
        return await speech_to_text_xfyun(audio, xfyun_app_id, xfyun_api_key, xfyun_api_secret)
    else:
        raise ValueError(f"不支持的语音识别服务商: {llm_provider}") 