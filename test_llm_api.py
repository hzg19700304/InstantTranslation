# @AI-Generated
"""
大模型API Key连通性测试脚本
"""
import httpx
import sys
import time

def test_openai(api_key: str):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 5
    }
    t0 = time.time()
    resp = httpx.post(url, headers=headers, json=payload, timeout=15)
    print(f"OpenAI响应: {resp.status_code}, 耗时: {time.time()-t0:.2f}s")
    print(resp.text)

def test_gemini(api_key: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello"}]}],
        "generationConfig": {"maxOutputTokens": 10}
    }
    t0 = time.time()
    resp = httpx.post(url, json=payload, timeout=15)
    print(f"Gemini响应: {resp.status_code}, 耗时: {time.time()-t0:.2f}s")
    print(resp.text)

def test_huggingface(api_key: str):
    url = "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": "Hello",
        "parameters": {"src_lang": "en_XX", "tgt_lang": "zh_CN"}
    }
    t0 = time.time()
    resp = httpx.post(url, headers=headers, json=payload, timeout=15)
    print(f"HuggingFace响应: {resp.status_code}, 耗时: {time.time()-t0:.2f}s")
    print(resp.text)

def test_deepseek(api_key: str):
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 5
    }
    t0 = time.time()
    resp = httpx.post(url, headers=headers, json=payload, timeout=15)
    print(f"DeepSeek响应: {resp.status_code}, 耗时: {time.time()-t0:.2f}s")
    print(resp.text)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("用法: python test_llm_api.py [provider] [api_key]")
        print("provider: openai | gemini | huggingface | deepseek")
        sys.exit(1)
    provider = sys.argv[1]
    api_key = sys.argv[2]
    if provider == "openai":
        test_openai(api_key)
    elif provider == "gemini":
        test_gemini(api_key)
    elif provider == "huggingface":
        test_huggingface(api_key)
    elif provider == "deepseek":
        test_deepseek(api_key)
    else:
        print("不支持的provider") 