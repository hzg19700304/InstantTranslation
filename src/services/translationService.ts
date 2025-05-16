
// 翻译服务
// 使用多个免费翻译API以提高可靠性

interface LibreTranslateResponse {
  translatedText: string;
  error?: string;
}

// 几个可用的免费翻译API端点
const TRANSLATION_API_ENDPOINTS = [
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.de/translate",
  "https://translate.terraprint.co/translate",  // 新增备用API
  "https://translate.astian.org/translate",     // 新增备用API
  "https://translate.mentality.rip/translate"   // 新增备用API
];

// 默认超时时间
const API_TIMEOUT_MS = 5000;

/**
 * 通过多个免费API翻译文本，提高可靠性
 */
export const translateText = async (
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<string> => {
  if (!text) return "";
  
  // 如果源语言和目标语言相同，直接返回原文
  if (sourceLanguage === targetLanguage) return text;
  
  // 准备API请求数据
  const requestBody = {
    q: text,
    source: sourceLanguage,
    target: targetLanguage,
    format: "text"
  };
  
  // 超时处理函数
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error("请求超时")), API_TIMEOUT_MS);
  });

  // 构建请求选项
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  // 用于存储错误信息
  let lastError = "";
  
  // 依次尝试每个API端点
  for (const apiUrl of TRANSLATION_API_ENDPOINTS) {
    try {
      console.log(`尝试使用API: ${apiUrl}`);
      
      // 发起带超时的请求
      const response = await Promise.race([
        fetch(apiUrl, requestOptions),
        timeoutPromise
      ]);
      
      if (!response.ok) {
        throw new Error(`API状态码: ${response.status}`);
      }
      
      const result: LibreTranslateResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log(`成功从${apiUrl}获取翻译`);
      return result.translatedText;
    } catch (error) {
      lastError = (error as Error).message;
      console.warn(`API ${apiUrl} 失败: ${lastError}`);
      // 继续尝试下一个API
    }
  }
  
  console.error("所有翻译API都失败了:", lastError);
  
  // 所有API都失败时，提供简单的回退翻译功能
  return getFallbackTranslation(text, sourceLanguage, targetLanguage) || 
         `[翻译失败: 无法连接到翻译服务]`;
};

/**
 * 提供基本的回退翻译功能
 */
const getFallbackTranslation = (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): string | null => {
  // 修正的字典结构，确保类型正确
  const dictionary: Record<string, Record<string, Record<string, string>>> = {
    "en": {
      "hello": { "zh": "你好" },
      "thank": { "zh": "谢谢" },
      "world": { "zh": "世界" },
      "translate": { "zh": "翻译" },
      "language": { "zh": "语言" },
      "error": { "zh": "错误" },
      "failed": { "zh": "失败" },
      "try": { "zh": "尝试" },
      "again": { "zh": "再次" }
    },
    "zh": {
      "你好": { "en": "hello" },
      "谢谢": { "en": "thank you" },
      "世界": { "en": "world" },
      "翻译": { "en": "translate" },
      "语言": { "en": "language" },
      "错误": { "en": "error" },
      "失败": { "en": "failed" },
      "尝试": { "en": "try" },
      "再次": { "en": "again" }
    }
  };
  
  // 检查字典中是否有匹配的词
  if (dictionary[sourceLanguage]) {
    for (const [key, translations] of Object.entries(dictionary[sourceLanguage])) {
      if (text.toLowerCase().includes(key.toLowerCase()) && 
          translations[targetLanguage]) {
        return `[离线翻译] ${translations[targetLanguage]}`;
      }
    }
  }
  
  return null;
};

/**
 * 大模型翻译功能
 * 支持多种大模型: HuggingFace, DeepSeek, Gemini
 */
export const translateWithLLM = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey?: string,
  modelType: string = "huggingface"
): Promise<string> => {
  if (!text) return "";
  if (sourceLanguage === targetLanguage) return text;
  if (!apiKey) return "需要API密钥才能使用大模型翻译";
  
  try {
    switch (modelType) {
      case "huggingface":
        return await translateWithHuggingFace(text, sourceLanguage, targetLanguage, apiKey);
      case "deepseek":
        return await translateWithDeepSeek(text, sourceLanguage, targetLanguage, apiKey);
      case "gemini":
        return await translateWithGemini(text, sourceLanguage, targetLanguage, apiKey);
      default:
        return "不支持的模型类型";
    }
  } catch (error) {
    console.error(`${modelType}翻译错误:`, error);
    return `[${modelType}翻译失败: ${(error as Error).message}]`;
  }
};

/**
 * 使用HuggingFace API进行翻译
 */
const translateWithHuggingFace = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  // HuggingFace Inference API端点
  const apiUrl = "https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt";
  
  // 准备提示词
  const sourceLangCode = getHFLanguageCode(sourceLanguage);
  const targetLangCode = getHFLanguageCode(targetLanguage);
  
  if (!sourceLangCode || !targetLangCode) {
    return "不支持的语言组合";
  }
  
  // 调用HuggingFace API
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: text,
      parameters: {
        src_lang: sourceLangCode,
        tgt_lang: targetLangCode
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  
  const result = await response.json();
  return Array.isArray(result) && result.length > 0 ? result[0].translation_text : "翻译失败";
};

/**
 * 使用DeepSeek API进行翻译
 */
const translateWithDeepSeek = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  // DeepSeek Chat API端点
  const apiUrl = "https://api.deepseek.com/v1/chat/completions";
  
  // 获取语言的完整名称用于提示词
  const sourceLangName = getLanguageName(sourceLanguage);
  const targetLangName = getLanguageName(targetLanguage);
  
  // 构建提示词
  const prompt = `将以下${sourceLangName}文本翻译为${targetLangName}，不要添加任何解释，仅输出翻译结果：\n\n${text}`;
  
  // 调用DeepSeek API
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是一个专业的${sourceLangName}到${targetLangName}翻译专家。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })
  });
  
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  
  const result = await response.json();
  return result.choices && result.choices.length > 0 ? 
    result.choices[0].message.content : "翻译失败";
};

/**
 * 使用Google Gemini API进行翻译
 */
const translateWithGemini = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  // Gemini API端点
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  
  // 获取语言的完整名称用于提示词
  const sourceLangName = getLanguageName(sourceLanguage);
  const targetLangName = getLanguageName(targetLanguage);
  
  // 构建提示词
  const prompt = `将以下${sourceLangName}文本翻译为${targetLangName}，不要添加任何解释，仅输出翻译结果：\n\n${text}`;
  
  // 调用Gemini API
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  
  const result = await response.json();
  return result.candidates && result.candidates.length > 0 && 
    result.candidates[0].content && result.candidates[0].content.parts && 
    result.candidates[0].content.parts.length > 0 ? 
    result.candidates[0].content.parts[0].text : "翻译失败";
};

// HuggingFace模型支持的语言代码映射
function getHFLanguageCode(code: string): string | null {
  const mapping: Record<string, string> = {
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
    // 其他语言可以按需添加
  };
  
  return mapping[code] || null;
}

// 获取语言的完整名称
function getLanguageName(code: string): string {
  const mapping: Record<string, string> = {
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
    // 可以按需添加更多语言
  };
  
  return mapping[code] || code;
}
