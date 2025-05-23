# @AI-Generated
"""
completeness 检测相关API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.completeness import (
    input_detector,
    llm_detector,
    trigger_detector,
    chinese_detector,
    english_detector
)

router = APIRouter()

class InputCompleteRequest(BaseModel):
    text: str
    language_code: str
    llm_api_key: str = None
    context: str = None
    provider: str = None

class InputCompleteResponse(BaseModel):
    is_complete: bool

@router.post("/input", response_model=InputCompleteResponse)
async def input_complete_check(req: InputCompleteRequest):
    """
    检查输入是否完整
    """
    try:
        is_complete = await input_detector.is_input_complete(req.text, req.language_code, req.llm_api_key, req.context, req.provider)
        return InputCompleteResponse(is_complete=is_complete)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class LLMCompleteRequest(BaseModel):
    text: str
    api_key: str

class LLMCompleteResponse(BaseModel):
    is_complete: bool

@router.post("/llm", response_model=LLMCompleteResponse)
async def llm_complete_check(req: LLMCompleteRequest):
    """
    使用大模型判断语句是否完整
    """
    try:
        is_complete = await llm_detector.is_sentence_complete_by_llm(req.text, req.api_key)
        return LLMCompleteResponse(is_complete=is_complete)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TriggerRequest(BaseModel):
    source_text: str
    source_language_code: str
    last_translated_text: str
    is_first_translation: bool
    llm_api_key: str = None

class TriggerResponse(BaseModel):
    should_translate: bool

@router.post("/trigger", response_model=TriggerResponse)
async def trigger_check(req: TriggerRequest):
    """
    检查是否应触发翻译
    """
    try:
        should = await trigger_detector.should_translate(
            req.source_text, req.source_language_code, req.last_translated_text, req.is_first_translation, req.llm_api_key
        )
        return TriggerResponse(should_translate=should)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TriggerExRequest(BaseModel):
    source_text: str
    source_language_code: str
    llm_api_key: str = None

class TriggerExResponse(BaseModel):
    should: bool
    is_complete: bool

@router.post("/trigger-ex", response_model=TriggerExResponse)
async def trigger_ex_check(req: TriggerExRequest):
    """
    增强版停顿/完整性检测
    """
    try:
        result = await trigger_detector.should_translate_ex(
            req.source_text, req.source_language_code, req.llm_api_key
        )
        return TriggerExResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EnglishCompleteRequest(BaseModel):
    text: str

class EnglishCompleteResponse(BaseModel):
    is_complete: bool

@router.post("/english", response_model=EnglishCompleteResponse)
def english_complete_check(req: EnglishCompleteRequest):
    """
    检查英文句子是否完整
    """
    try:
        is_complete = english_detector.is_english_sentence_complete(req.text)
        return EnglishCompleteResponse(is_complete=is_complete)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 