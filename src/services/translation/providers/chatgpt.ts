
/**
 * ChatGPT翻译服务提供者
 */

import { toast } from "sonner";

/**
 * 使用ChatGPT进行翻译
 */
export const translateWithChatGPT = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    toast.error("请提供ChatGPT API密钥", {
      description: "需要API密钥才能使用ChatGPT进行翻译"
    });
    return "[翻译失败: 缺少API密钥]";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 使用较新的模型
        messages: [
          {
            role: "system",
            content: `你是一名专业翻译员，请将以下${sourceLanguage}文本准确翻译成${targetLanguage}。只需提供翻译结果，不要添加任何解释或额外内容。`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3, // 较低的温度以获得更准确的翻译
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ChatGPT API错误:", errorData);
      return `[翻译失败: API错误 ${response.status}]`;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("ChatGPT翻译错误:", error);
    return "[翻译失败: 连接错误]";
  }
};

/**
 * 测试ChatGPT API连接
 */
export const testChatGPTConnection = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Hello"
          }
        ],
        max_tokens: 5
      })
    });

    return response.ok;
  } catch (error) {
    console.error("测试ChatGPT连接失败:", error);
    return false;
  }
};
