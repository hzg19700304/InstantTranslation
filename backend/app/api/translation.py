# @AI-Generated
"""
翻译相关API
"""
from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request
from pydantic import BaseModel, Field
from app.services.llm_translation import translate_with_llm
from app.services.completeness.llm_completeness import analyze_sentence_completeness_with_llm, is_chinese_sentence_complete
from app.services.speech_router import speech_to_text_with_llm
from typing import Optional
from fastapi.responses import JSONResponse

router = APIRouter()

class TranslationRequest(BaseModel):
    """
    定义请求体
    """
    source_text: str = Field(..., description="原文")
    source_language: str = Field(..., description="源语言代码")
    target_language: str = Field(..., description="目标语言代码")
    llm_api_key: str = Field(..., description="大模型API密钥")
    llm_provider: str = Field(..., description="大模型服务商")

class TranslationResponse(BaseModel):
    """
    定义响应体
    :param translated_text: 翻译后的文本内容
    """
    translated_text: str  # 翻译结果，字符串类型，返回给前端

class CompletenessRequest(BaseModel):
    """
    语句完整性分析请求体
    :param text: 需要分析的语句
    :param llm_api_key: 大模型API密钥
    :param llm_provider: 大模型服务商
    """
    text: str
    llm_api_key: str
    llm_provider: str

class CompletenessResponse(BaseModel):
    """
    语句完整性分析响应体
    :param is_complete: 是否为完整句
    :param reason: 分析理由或模型原文
    """
    is_complete: bool
    reason: str

class SpeechToTextResponse(BaseModel):
    """
    语音识别响应体
    :param text: 识别出的文本
    :param confidence: 置信度（如有）
    """
    text: str
    confidence: Optional[float] = None

class ChineseCompletenessRequest(BaseModel):
    text: str

class ChineseCompletenessResponse(BaseModel):
    is_complete: bool

class TestConnectionRequest(BaseModel):
    provider: str
    api_key: str

class TestConnectionResponse(BaseModel):
    ok: bool
    message: str

@router.post("/", response_model=TranslationResponse)
async def translate(req: TranslationRequest):
    """
    调用大模型进行翻译
    """
    print("[后端API] 收到翻译请求:", req.dict())
    try:
        result = await translate_with_llm(
            req.source_text,
            req.source_language,
            req.target_language,
            req.llm_api_key,
            req.llm_provider
        )
        print("[后端API] 返回翻译结果:", result)
        return TranslationResponse(translated_text=result)
    except Exception as e:
        print("[后端API] 翻译异常:", str(e))
        raise HTTPException(status_code=500, detail=f"翻译失败: {str(e)}")

@router.post("/completeness", response_model=CompletenessResponse)
async def analyze_completeness(req: CompletenessRequest):
    """
    调用大模型分析语句是否完整
    """
    try:
        is_complete, reason = await analyze_sentence_completeness_with_llm(
            req.text, req.llm_api_key, req.llm_provider
        )
        return CompletenessResponse(is_complete=is_complete, reason=reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"完整性分析失败: {str(e)}")

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    audio: UploadFile = File(..., description="音频文件"),
    llm_provider: str = Form(..., description="服务商(openai/google/xfyun)"),
    llm_api_key: Optional[str] = Form(None, description="大模型API密钥/Google服务账号JSON字符串"),
    xfyun_app_id: Optional[str] = Form(None, description="讯飞AppID"),
    xfyun_api_key: Optional[str] = Form(None, description="讯飞APIKey"),
    xfyun_api_secret: Optional[str] = Form(None, description="讯飞APISecret")
):
    """
    调用大模型或第三方API进行语音识别
    """
    try:
        text, confidence = await speech_to_text_with_llm(
            audio,
            llm_provider=llm_provider,
            llm_api_key=llm_api_key,
            xfyun_app_id=xfyun_app_id,
            xfyun_api_key=xfyun_api_key,
            xfyun_api_secret=xfyun_api_secret
        )
        return SpeechToTextResponse(text=text, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音识别失败: {str(e)}")

@router.post("/chinese-completeness", response_model=ChineseCompletenessResponse)
async def chinese_completeness_check(req: ChineseCompletenessRequest):
    """
    检查中文句子是否完整（规则判断，非AI）
    """
    if not req.text or not isinstance(req.text, str):
        raise HTTPException(status_code=400, detail="text 字段不能为空且必须为字符串")
    try:
        is_complete = is_chinese_sentence_complete(req.text)
        return ChineseCompletenessResponse(is_complete=is_complete)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(req: TestConnectionRequest):
    """
    测试大模型API连通性
    """
    provider = req.provider.lower()
    api_key = req.api_key
    try:
        if provider == "chatgpt":
            # OpenAI ChatGPT 测试
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": "Hello"}],
                        "max_tokens": 5
                    },
                    timeout=10
                )
                if resp.is_success:
                    return TestConnectionResponse(ok=True, message="ChatGPT 连接成功")
                else:
                    return TestConnectionResponse(ok=False, message=f"ChatGPT 连接失败: {resp.text}")
        elif provider == "gemini":
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": "Hello"}]}],
                        "generationConfig": {"maxOutputTokens": 10}
                    },
                    timeout=10
                )
                if resp.is_success:
                    return TestConnectionResponse(ok=True, message="Gemini 连接成功")
                else:
                    return TestConnectionResponse(ok=False, message=f"Gemini 连接失败: {resp.text}")
        elif provider == "huggingface":
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "inputs": "Hello",
                        "parameters": {"src_lang": "en_XX", "tgt_lang": "zh_CN"}
                    },
                    timeout=10
                )
                if resp.is_success:
                    return TestConnectionResponse(ok=True, message="HuggingFace 连接成功")
                else:
                    return TestConnectionResponse(ok=False, message=f"HuggingFace 连接失败: {resp.text}")
        elif provider == "deepseek":
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": "Hello"}],
                        "max_tokens": 5
                    },
                    timeout=10
                )
                if resp.is_success:
                    return TestConnectionResponse(ok=True, message="DeepSeek 连接成功")
                else:
                    return TestConnectionResponse(ok=False, message=f"DeepSeek 连接失败: {resp.text}")
        else:
            return TestConnectionResponse(ok=False, message="不支持的 provider")
    except Exception as e:
        return TestConnectionResponse(ok=False, message=f"连接异常: {str(e)}") 