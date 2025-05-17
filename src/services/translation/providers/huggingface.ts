
// HuggingFace translation provider

import { getHFLanguageCode } from '../utils';

/**
 * 使用HuggingFace API进行翻译
 */
export const translateWithHuggingFace = async (
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
 * 测试HuggingFace API连接
 */
export const testHuggingFaceConnection = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // 使用简单的查询测试API连接
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: {
          src_lang: "en_XX",
          tgt_lang: "zh_CN"
        }
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error("HuggingFace API连接测试失败:", error);
    return false;
  }
};
