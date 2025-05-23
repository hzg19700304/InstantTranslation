# @AI-Generated
"""
大模型语句完整性分析服务
"""
import httpx
from app.services.ai_base import Optional
from typing import Tuple
import time

async def analyze_sentence_completeness_with_llm(text: str, api_key: str, provider: str) -> Tuple[bool, str]:
    """
    调用大模型API分析语句是否为完整句
    :param text: 需要分析的语句
    :param api_key: 大模型API密钥
    :param provider: 大模型服务商
    :return: (是否完整, 分析理由或原文)
    """
    if provider == "chatgpt":
        return await _analyze_with_chatgpt(text, api_key)
    elif provider == "gemini":
        return await _analyze_with_gemini(text, api_key)
    elif provider == "deepseek":
        return await _analyze_with_deepseek(text, api_key)
    else:
        raise ValueError(f"不支持的LLM提供者: {provider}")

async def _analyze_with_chatgpt(text: str, api_key: str):
    prompt = (
        "请判断下面这句话是否为完整句。如果完整，回复 'true' 并简要说明理由；如果不完整，回复 'false' 并说明原因。\n句子：" + text
    )
    messages = [
        {"role": "system", "content": "你是中文语法专家。"},
        {"role": "user", "content": prompt}
    ]
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 256
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
    content = data["choices"][0]["message"]["content"].strip().lower()
    if content.startswith("true"):
        return True, data["choices"][0]["message"]["content"].strip()
    if content.startswith("false"):
        return False, data["choices"][0]["message"]["content"].strip()
    if "完整" in content:
        return True, data["choices"][0]["message"]["content"].strip()
    return False, data["choices"][0]["message"]["content"].strip()

async def _analyze_with_gemini(text: str, api_key: str):
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    prompt = f"请判断下面这句话是否为完整句。如果完整，回复 'true' 并简要说明理由；如果不完整，回复 'false' 并说明原因。\n句子：{text}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 256}
    }
    start = time.time()
    async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, json=payload, headers=headers, timeout=30)
    duration = time.time() - start
    print(f"[LLM耗时] provider=gemini, 接口=generateContent, 耗时: {duration:.2f}秒")
    if not resp.is_success:
        raise Exception(f"Gemini API错误: {resp.status_code}")
    result = resp.json()
    content = result["candidates"][0]["content"]["parts"][0]["text"].strip().lower()
    if content.startswith("true"):
        return True, result["candidates"][0]["content"]["parts"][0]["text"].strip()
    if content.startswith("false"):
        return False, result["candidates"][0]["content"]["parts"][0]["text"].strip()
    if "完整" in content:
        return True, result["candidates"][0]["content"]["parts"][0]["text"].strip()
    return False, result["candidates"][0]["content"]["parts"][0]["text"].strip()

async def _analyze_with_deepseek(text: str, api_key: str):
    api_url = "https://api.deepseek.com/v1/chat/completions"
    prompt = f"请判断下面这句话是否为完整句。如果完整，回复 'true' 并简要说明理由；如果不完整，回复 'false' 并说明原因。\n句子：{text}"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是中文语法专家。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 256
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
    content = result["choices"][0]["message"]["content"].strip().lower()
    if content.startswith("true"):
        return True, result["choices"][0]["message"]["content"].strip()
    if content.startswith("false"):
        return False, result["choices"][0]["message"]["content"].strip()
    if "完整" in content:
        return True, result["choices"][0]["message"]["content"].strip()
    return False, result["choices"][0]["message"]["content"].strip()

def is_chinese_sentence_complete(text: str) -> bool:
    """
    判断中文句子是否完整（规则判断，非AI）
    :param text: 待判断文本
    :return: 是否为完整句子
    """
    if not text or len(text) < 3:
        return False
    trimmed = text.strip()
    last_char = trimmed[-1]
    # 完整标点
    ending_punct = '。！？…；：?!;:'
    ends_with_punct = last_char in ending_punct
    # 未闭合标点
    open_quotes = sum(trimmed.count(c) for c in '「『（')
    close_quotes = sum(trimmed.count(c) for c in '」』）')
    has_unclosed = open_quotes != close_quotes
    # 常见连接词
    conjunctions = ['和', '或', '但', '因为', '所以', '如果', '但是', '而且', '并且', '虽然', '然而', '而', '且', '及', '与', '并', '而是']
    ends_with_conj = any(trimmed.endswith(conj) for conj in conjunctions)
    has_min_length = len(trimmed) >= 4
    is_long_enough = len(trimmed) >= 8 and not ends_with_conj
    is_question = any(x in trimmed for x in ['吗', '呢', '？', '什么', '谁', '哪', '怎', '为什么'])
    is_semantic_complete = has_min_length and not ends_with_conj and len(trimmed) >= 6
    # 仅当以完整标点结束且无未闭合元素时认为完整
    return ends_with_punct and not has_unclosed 