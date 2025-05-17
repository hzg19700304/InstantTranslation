
// Free API-based translation service implementation

import { LibreTranslateResponse } from './types';
import { getFallbackTranslation } from './utils';

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
