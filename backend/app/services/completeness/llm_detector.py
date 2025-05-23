# @AI-Generated
"""
LLM 检测器
"""
import httpx
import time

async def is_sentence_complete_by_llm(text: str, api_key: str, context: str = None, provider: str = None) -> bool:
    """
    使用大模型判断语句是否完整，支持上下文和多模型中英文 prompt
    :param text: 要判断的文本
    :param api_key: OpenAI API密钥
    :param context: 上下文（可选）
    :param provider: LLM 服务商（如 deepseek、chatgpt 等，可选）
    :return: 语句是否完整
    """
    if provider == 'deepseek':
        # 中文 prompt
        if context:
            prompt = (
                "请结合上下文判断下面这句话是否为完整句。标准：\n"
                "1. 语法结构完整（主谓宾等）\n"
                "2. 语义表达完整（表达一个完整意思）\n"
                "3. 没有未闭合的标点符号\n"
                "4. 不是混合语言句子\n"
                "5. 不是截断句\n\n"
                f"上下文：{context}\n句子：{text}\n"
                "只回复 true 或 false，不要其他解释。"
            )
        else:
            prompt = (
                "请判断下面这句话是否为完整句。标准：\n"
                "1. 语法结构完整（主谓宾等）\n"
                "2. 语义表达完整（表达一个完整意思）\n"
                "3. 没有未闭合的标点符号\n"
                "4. 不是混合语言句子\n"
                "5. 不是截断句\n\n"
                f"句子：{text}\n"
                "只回复 true 或 false，不要其他解释。"
            )
    else:
        # 英文 prompt
        if context:
            prompt = (
                "Please determine if the following sentence is complete and well-formed, considering the context. Criteria:\n"
                "1. Complete grammatical structure (subject, predicate, object)\n"
                "2. Complete semantic meaning (expresses a complete thought)\n"
                "3. No unclosed punctuation marks\n"
                "4. Not a mixed language sentence\n"
                "5. Not a truncated sentence\n\n"
                f"Context: {context}\nSentence: {text}\n"
                "Return only true or false, no other explanation."
            )
        else:
            prompt = (
                "Please determine if the following sentence is complete and well-formed. Criteria:\n"
                "1. Complete grammatical structure (subject, predicate, object)\n"
                "2. Complete semantic meaning (expresses a complete thought)\n"
                "3. No unclosed punctuation marks\n"
                "4. Not a mixed language sentence\n"
                "5. Not a truncated sentence\n\n"
                f"Sentence: {text}\n"
                "Return only true or false, no other explanation."
            )
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a sentence completeness checker. Return only true or false, no other explanation."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 10
    }
    try:
        start = time.time()
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=15)
        duration = time.time() - start
        print(f"[LLM耗时] provider={{provider or 'openai'}}, 接口=chat_completions, 耗时: {{duration:.2f}}秒")
        data = resp.json()
        result = data["choices"][0]["message"]["content"].strip().lower()
        return result == 'true'
    except Exception:
        return False

async def is_translatable_word(text: str, api_key: str, context: str = None, provider: str = None) -> bool:
    """
    判断输入是否为可独立翻译的词汇或短语，支持上下文和多模型中英文 prompt
    :param text: 输入内容
    :param api_key: OpenAI API密钥
    :param context: 上下文（可选）
    :param provider: LLM 服务商（如 deepseek、chatgpt 等，可选）
    :return: 是否为可翻译的词汇/短语
    """
    if provider == 'deepseek':
        # 中文 prompt
        if context:
            prompt = (
                "请结合上下文判断下面输入是否为可直接翻译的独立词汇或短语（不是句子、不是片段、不是乱码）。\n"
                f"上下文：{context}\n输入：{text}\n"
                "只回复 true 或 false。"
            )
        else:
            prompt = (
                "请判断下面输入是否为可直接翻译的独立词汇或短语（不是句子、不是片段、不是乱码）。\n"
                f"输入：{text}\n"
                "只回复 true 或 false。"
            )
    else:
        # 英文 prompt
        if context:
            prompt = (
                "Please determine if the following input is a standalone word or phrase that can be directly translated (not a sentence, not a fragment, not gibberish), considering the context.\n"
                f"Context: {context}\nInput: {text}\n"
                "Return only true or false."
            )
        else:
            prompt = (
                "Please determine if the following input is a standalone word or phrase that can be directly translated (not a sentence, not a fragment, not gibberish). Return only true or false.\nInput: " + text
            )
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a translation assistant. Return only true or false, no other explanation."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 10
    }
    try:
        start = time.time()
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=15)
        duration = time.time() - start
        print(f"[LLM耗时] provider={{provider or 'openai'}}, 接口=chat_completions, 耗时: {{duration:.2f}}秒")
        data = resp.json()
        result = data["choices"][0]["message"]["content"].strip().lower()
        return result == 'true'
    except Exception:
        return False 