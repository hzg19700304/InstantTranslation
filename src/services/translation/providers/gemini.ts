
// Google Gemini translation provider

import { getLanguageName } from '../utils';

/**
 * 使用Google Gemini API进行翻译
 */
export const translateWithGemini = async (
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

/**
 * 测试Gemini API连接
 */
export const testGeminiConnection = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // 使用简单的查询测试API连接
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
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
                text: "Hello"
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error("Gemini API连接测试失败:", error);
    return false;
  }
};
