
// DeepSeek translation provider

import { getLanguageName } from '../utils';

/**
 * 使用DeepSeek API进行翻译
 */
export const translateWithDeepSeek = async (
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
 * 测试DeepSeek API连接
 */
export const testDeepSeekConnection = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // 使用简单的查询测试API连接
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Hello"
          }
        ],
        max_tokens: 10
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error("DeepSeek API连接测试失败:", error);
    return false;
  }
};
