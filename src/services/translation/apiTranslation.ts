
// Free API-based translation service implementation

import { LibreTranslateResponse } from './types';
import { getFallbackTranslation } from './utils';

// 几个可用的免费翻译API端点
const TRANSLATION_API_ENDPOINTS = [
  "https://translate.terraprint.co/translate",  // 更可靠的API放在前面
  "https://translate.astian.org/translate",     
  "https://translate.mentality.rip/translate",
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.de/translate"
];

// 默认超时时间
const API_TIMEOUT_MS = 8000; // 增加超时时间，给API更多响应时间

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
  
  // 对于一些特殊语言代码进行映射，确保与API兼容
  const mappedSourceLang = mapLanguageCode(sourceLanguage);
  const mappedTargetLang = mapLanguageCode(targetLanguage);
  
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
      
      const result: LibreTranslateResponse = await response.json();
      
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
    // 添加更多映射...
  };
  
  return codeMapping[code] || code;
}
