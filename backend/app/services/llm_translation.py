# @AI-Generated
"""
大模型翻译相关服务
"""
import httpx
from .ai_base import Optional
import time

HF_LANG_MAP = {
    "en": "en_XX",
    "zh": "zh_CN",
    "fr": "fr_XX",
    "de": "de_DE",
    "es": "es_XX",
    "it": "it_IT",
    "ja": "ja_XX",
    "ko": "ko_KR",
    "ru": "ru_RU",
    "pt": "pt_XX",
    "ar": "ar_AR"
}

LANG_NAME_MAP = {
    "en": "英语",
    "zh": "中文",
    "fr": "法语",
    "de": "德语",
    "es": "西班牙语",
    "it": "意大利语",
    "ja": "日语",
    "ko": "韩语",
    "ru": "俄语",
    "pt": "葡萄牙语",
    "ar": "阿拉伯语",
    "nl": "荷兰语",
    "pl": "波兰语",
    "tr": "土耳其语"
}

async def translate_with_llm(
    text: str,
    source_language: str,
    target_language: str,
    api_key: str,
    provider: str
) -> str:
    """
    调用大模型API进行翻译
    """
    if provider == "chatgpt":
        return await translate_with_chatgpt(text, source_language, target_language, api_key)
    elif provider == "huggingface":
        return await translate_with_huggingface(text, source_language, target_language, api_key)
    elif provider == "gemini":
        return await translate_with_gemini(text, source_language, target_language, api_key)
    elif provider == "deepseek":
        return await translate_with_deepseek(text, source_language, target_language, api_key)
    else:
        raise ValueError(f"不支持的LLM提供者: {provider}")

# ChatGPT
async def translate_with_chatgpt(text: str, source_language: str, target_language: str, api_key: str) -> str:
    lang_map = {
        'zh': 'Chinese', 'en': 'English', 'ja': 'Japanese', 'ko': 'Korean',
        'fr': 'French', 'de': 'German', 'es': 'Spanish', 'it': 'Italian',
        'ru': 'Russian', 'pt': 'Portuguese', 'ar': 'Arabic'
    }
    source_lang_name = lang_map.get(source_language, source_language)
    target_lang_name = lang_map.get(target_language, target_language)
    messages = [
        {"role": "system", "content": "You are a translation engine. Only output the translation result, no explanation."},
        {"role": "user", "content": f"Translate the following text from {source_lang_name} to {target_lang_name}: {text}"}
    ]
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 2048
    }
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=30)
    duration = time.time() - start
    print(f"[LLM耗时] provider=chatgpt, 接口=chat_completions, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        try:
            err = resp.json()
            msg = err.get("error", {}).get("message", "API错误")
        except Exception:
            msg = "API错误"
        raise Exception(f"ChatGPT API错误: {msg}")
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()

# HuggingFace
async def translate_with_huggingface(text: str, source_language: str, target_language: str, api_key: str) -> str:
    api_url = "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt"
    src_lang = HF_LANG_MAP.get(source_language)
    tgt_lang = HF_LANG_MAP.get(target_language)
    if not src_lang or not tgt_lang:
        return "不支持的语言组合"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"inputs": text, "parameters": {"src_lang": src_lang, "tgt_lang": tgt_lang}}
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, json=payload, headers=headers, timeout=30)
    duration = time.time() - start
    print(f"[LLM耗时] provider=huggingface, 接口=mbart-large-50, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        raise Exception(f"HuggingFace API错误: {resp.status_code}")
    result = resp.json()
    if isinstance(result, list) and result:
        return result[0].get("translation_text", "翻译失败")
    return "翻译失败"

# Gemini
async def translate_with_gemini(text: str, source_language: str, target_language: str, api_key: str) -> str:
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    source_lang = LANG_NAME_MAP.get(source_language, source_language)
    target_lang = LANG_NAME_MAP.get(target_language, target_language)
    prompt = f"将以下{source_lang}文本翻译为{target_lang}，不要添加任何解释，仅输出翻译结果：\n\n{text}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 800
        }
    }
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, json=payload, headers=headers, timeout=30)
    duration = time.time() - start
    print(f"[LLM耗时] provider=gemini, 接口=generateContent, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        raise Exception(f"Gemini API错误: {resp.status_code}")
    result = resp.json()
    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return "翻译失败"

# DeepSeek
async def translate_with_deepseek(text: str, source_language: str, target_language: str, api_key: str) -> str:
    api_url = "https://api.deepseek.com/v1/chat/completions"
    source_lang = LANG_NAME_MAP.get(source_language, source_language)
    target_lang = LANG_NAME_MAP.get(target_language, target_language)
    prompt = f"将以下{source_lang}文本翻译为{target_lang}，不要添加任何解释，仅输出翻译结果：\n\n{text}"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": f"你是一个专业的{source_lang}到{target_lang}翻译专家。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 2048
    }
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, json=payload, headers=headers, timeout=30)
    duration = time.time() - start
    print(f"[LLM耗时] provider=deepseek, 接口=chat_completions, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        try:
            err = resp.json()
            msg = err.get("error", {}).get("message", "API错误")
        except Exception:
            msg = "API错误"
        raise Exception(f"DeepSeek API错误: {msg}")
    result = resp.json()
    try:
        return result["choices"][0]["message"]["content"]
    except Exception:
        return "翻译失败" 