# 后端 API 接口文档

## 1. 翻译接口

### POST /api/translation/
- **功能**：调用大模型进行翻译
- **请求参数**（JSON）：
  - `source_text`：原文（string，必填）
  - `source_language`：源语言代码（string，必填）
  - `target_language`：目标语言代码（string，必填）
  - `llm_api_key`：大模型API密钥（string，必填）
  - `llm_provider`：大模型服务商（string，必填，如 chatgpt/gemini/deepseek/huggingface）
- **返回值**：
  - `translated_text`：翻译结果（string）

#### 示例
```json
POST /api/translation/
{
  "source_text": "Hello world!",
  "source_language": "en",
  "target_language": "zh",
  "llm_api_key": "sk-...",
  "llm_provider": "chatgpt"
}
返回：
{
  "translated_text": "你好，世界！"
}
```

---

## 2. 语句完整性检测

### 2.1 大模型完整性检测
#### POST /api/translation/completeness/llm
- **功能**：用大模型判断语句是否完整
- **请求参数**（JSON）：
  - `text`：待检测文本（string，必填）
  - `api_key`：大模型API密钥（string，必填）
- **返回值**：
  - `is_complete`：是否完整（bool）

### 2.2 规则完整性检测（中文/英文/通用）
#### POST /api/translation/completeness/input
- **功能**：规则判断输入是否完整
- **请求参数**（JSON）：
  - `text`：待检测文本（string，必填）
  - `language_code`：语言代码（string，必填，如 zh/en）
  - `llm_api_key`：可选，优先用大模型判断
- **返回值**：
  - `is_complete`：是否完整（bool）

#### POST /api/translation/completeness/english
- **功能**：英文句子完整性检测
- **请求参数**（JSON）：
  - `text`：英文文本（string，必填）
- **返回值**：
  - `is_complete`：是否完整（bool）

#### POST /api/translation/chinese-completeness
- **功能**：中文句子完整性检测
- **请求参数**（JSON）：
  - `text`：中文文本（string，必填）
- **返回值**：
  - `is_complete`：是否完整（bool）

---

## 3. 翻译触发检测

### POST /api/translation/completeness/trigger
- **功能**：判断是否应触发翻译（结合停顿、完整性等）
- **请求参数**（JSON）：
  - `source_text`：原文（string，必填）
  - `source_language_code`：语言代码（string，必填）
  - `last_translated_text`：上次翻译文本（string，必填）
  - `is_first_translation`：是否首次翻译（bool，必填）
  - `llm_api_key`：可选
- **返回值**：
  - `should_translate`：是否应触发（bool）

### POST /api/translation/completeness/trigger-ex
- **功能**：增强版停顿/完整性检测
- **请求参数**（JSON）：
  - `source_text`：原文（string，必填）
  - `source_language_code`：语言代码（string，必填）
  - `llm_api_key`：可选
- **返回值**：
  - `should`：是否应触发（bool）
  - `is_complete`：是否完整（bool）

---

## 4. 语音识别接口

### POST /api/translation/speech-to-text
- **功能**：上传音频并识别为文本
- **请求参数**（multipart/form-data）：
  - `audio`：音频文件（必填，UploadFile）
  - `llm_provider`：服务商（openai/google/xfyun，必填）
  - `llm_api_key`：大模型API密钥/Google服务账号JSON（可选）
  - `xfyun_app_id`/`xfyun_api_key`/`xfyun_api_secret`：讯飞参数（可选）
- **返回值**：
  - `text`：识别文本（string）
  - `confidence`：置信度（float，可选）

---

## 5. LLM连通性测试

### POST /api/translation/test-connection
- **功能**：测试大模型API连通性
- **请求参数**（JSON）：
  - `provider`：服务商（chatgpt/gemini/huggingface/deepseek，必填）
  - `api_key`：API密钥（必填）
- **返回值**：
  - `ok`：连通性（bool）
  - `message`：结果说明（string）

---

> 所有接口均返回标准JSON，出错时返回HTTP 4xx/5xx及详细错误信息。 