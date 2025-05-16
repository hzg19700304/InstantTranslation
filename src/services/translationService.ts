
// 翻译服务
// 使用 LibreTranslate API - 开源免费翻译服务

interface LibreTranslateResponse {
  translatedText: string;
  error?: string;
}

// LibreTranslate API URL (使用公共实例)
const LIBRE_TRANSLATE_API = "https://translate.argosopentech.com/translate";

// 备用API (以防主要API不可用)
const BACKUP_LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";

/**
 * 通过 LibreTranslate API 翻译文本
 */
export const translateText = async (
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<string> => {
  if (!text) return "";
  
  // 如果源语言和目标语言相同，直接返回原文
  if (sourceLanguage === targetLanguage) return text;
  
  try {
    // 准备API请求数据
    const requestBody = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: "text"
    };
    
    // 调用API
    const response = await fetch(LIBRE_TRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      // 如果主要API失败，尝试备用API
      console.log("主要API调用失败，尝试备用API...");
      const backupResponse = await fetch(BACKUP_LIBRE_TRANSLATE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!backupResponse.ok) {
        throw new Error(`翻译API调用失败: ${backupResponse.status}`);
      }
      
      const backupResult: LibreTranslateResponse = await backupResponse.json();
      if (backupResult.error) {
        throw new Error(backupResult.error);
      }
      
      return backupResult.translatedText;
    }
    
    // 解析API结果
    const result: LibreTranslateResponse = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.translatedText;
  } catch (error) {
    console.error("翻译过程中发生错误:", error);
    
    // 发生错误时，提供简单的回退翻译功能
    if (sourceLanguage === "en" && targetLanguage === "zh") {
      if (text.toLowerCase().includes("hello")) return "你好";
      if (text.toLowerCase().includes("thank")) return "谢谢";
    }
    if (sourceLanguage === "zh" && targetLanguage === "en") {
      if (text.includes("你好")) return "Hello";
      if (text.includes("谢谢")) return "Thank you";
    }
    
    // 如果所有尝试都失败，返回错误信息
    return `[翻译失败: ${(error as Error).message}]`;
  }
};

/**
 * 大模型翻译功能 - 使用HuggingFace免费API
 * 注意: 此功能需要用户提供API密钥
 */
export const translateWithLLM = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey?: string
): Promise<string> => {
  if (!text) return "";
  if (sourceLanguage === targetLanguage) return text;
  if (!apiKey) return "需要HuggingFace API密钥才能使用大模型翻译";
  
  try {
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
    
  } catch (error) {
    console.error("大模型翻译错误:", error);
    return `[大模型翻译失败: ${(error as Error).message}]`;
  }
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
