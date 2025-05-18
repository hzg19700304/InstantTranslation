
// Free API-based translation service implementation

import { LibreTranslateResponse } from './types';
import { getFallbackTranslation } from './utils';

// 几个可用的免费翻译API端点 - 重新排序并增加更多可靠端点
const TRANSLATION_API_ENDPOINTS = [
  "https://translate.terraprint.co/translate",  
  "https://libretranslate.de/translate", // 提升优先级
  "https://translate.argosopentech.com/translate", // 提升优先级
  "https://translate.astian.org/translate",     
  "https://translate.mentality.rip/translate",
  "https://api.lingva.ml/api/v1/translate", // 添加额外的API
  "https://translate.api.skitzen.com/translate" // 添加额外的API
];

// 默认超时时间
const API_TIMEOUT_MS = 10000; // 进一步增加超时时间

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

  console.log(`尝试翻译从 ${sourceLanguage} 到 ${targetLanguage}`, { text: text.substring(0, 50) + (text.length > 50 ? '...' : '') });
  
  // 对于一些特殊语言代码进行映射，确保与API兼容
  const mappedSourceLang = mapLanguageCode(sourceLanguage);
  const mappedTargetLang = mapLanguageCode(targetLanguage);

  console.log(`映射后的语言代码: ${mappedSourceLang} -> ${mappedTargetLang}`);
  
  // 准备API请求数据
  const requestBody = {
    q: text,
    source: mappedSourceLang,
    target: mappedTargetLang,
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
      
      let result: LibreTranslateResponse;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error(`解析返回JSON失败: ${e}`);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.translatedText || result.translatedText.trim() === '') {
        throw new Error("返回的翻译结果为空");
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
  const fallbackResult = getFallbackTranslation(text, sourceLanguage, targetLanguage);
  return fallbackResult || `[翻译失败: 无法连接到翻译服务]`;
};

/**
 * 映射语言代码以确保与API兼容
 */
function mapLanguageCode(code: string): string {
  // 一些API使用不同的语言代码，这里进行必要的映射
  const codeMapping: Record<string, string> = {
    'zh': 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'en': 'en',
    'en-US': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'it': 'it',
    'ru': 'ru',
    'pt': 'pt',
    'ar': 'ar',
    'nl': 'nl',
    'pl': 'pl',
    'tr': 'tr',
    'auto': 'auto', // 添加自动检测
    'zh_CN': 'zh',  // 处理可能的其他格式
    'zh_TW': 'zh',
    'en_US': 'en',
    'en_GB': 'en',
    // 添加可能缺失的语言代码映射
    'cs': 'cs',     // 捷克语
    'da': 'da',     // 丹麦语
    'fi': 'fi',     // 芬兰语
    'el': 'el',     // 希腊语
    'he': 'he',     // 希伯来语
    'hi': 'hi',     // 印地语
    'hu': 'hu',     // 匈牙利语
    'id': 'id',     // 印尼语
    'no': 'no',     // 挪威语
    'ro': 'ro',     // 罗马尼亚语
    'sk': 'sk',     // 斯洛伐克语
    'sv': 'sv',     // 瑞典语
    'th': 'th',     // 泰语
    'uk': 'uk',     // 乌克兰语
    'vi': 'vi'      // 越南语
  };
  
  return codeMapping[code] || code;
}

// 尝试备用请求格式（用于某些特殊API）
async function tryAlternativeRequest(apiUrl: string, text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  try {
    // Lingva Translate API格式
    if (apiUrl.includes('lingva.ml')) {
      const lingvaUrl = `${apiUrl}/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
      const response = await fetch(lingvaUrl);
      if (response.ok) {
        const data = await response.json();
        return data.translation || null;
      }
    }
    return null;
  } catch (error) {
    console.warn(`备用请求格式失败:`, error);
    return null;
  }
}
