/**
 * ChatGPT翻译服务提供者
 */

import { toast } from "sonner";
import { getLanguageName } from "../utils";

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
    // 获取语言的英文名称用于提示词
    const getLangName = (code: string) => {
      switch (code) {
        case 'zh': return 'Chinese';
        case 'en': return 'English';
        case 'ja': return 'Japanese';
        case 'ko': return 'Korean';
        case 'fr': return 'French';
        case 'de': return 'German';
        case 'es': return 'Spanish';
        case 'it': return 'Italian';
        case 'ru': return 'Russian';
        case 'pt': return 'Portuguese';
        case 'ar': return 'Arabic';
        default: return code;
      }
    };
    const sourceLangName = getLangName(sourceLanguage);
    const targetLangName = getLangName(targetLanguage);
    
    // 优化后的 prompt，减少模型误解
    const messages = [
      {
        role: "system",
        content: "You are a translation engine. Only output the translation result, no explanation."
      },
      {
        role: "user",
        content: `Translate the following text from ${sourceLangName} to ${targetLangName}: ${text}`
      }
    ];
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    // 详细记录响应状态以便调试
    console.log("ChatGPT API响应状态:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("ChatGPT API错误:", errorData);
      
      // 更详细的错误消息
      let errorMessage = "请检查API密钥是否正确";
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
        
        // 针对常见错误给出更友好的提示
        if (errorMessage.includes("invalid_api_key")) {
          errorMessage = "API密钥无效，请确保输入了正确的OpenAI API密钥";
        } else if (errorMessage.includes("insufficient_quota")) {
          errorMessage = "API账户余额不足，请检查您的OpenAI账户";
        }
      }
      
      toast.error(`API错误: ${response.status}`, {
        description: errorMessage
      });
      return `[翻译失败: API错误 ${response.status}]`;
    }

    const data = await response.json();
    console.log("ChatGPT API返回成功");
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("ChatGPT翻译错误:", error);
    toast.error("翻译失败", {
      description: "连接OpenAI API时出错，请检查网络连接或代理设置"
    });
    return "[翻译失败: 连接错误]";
  }
};

/**
 * 测试ChatGPT API连接
 */
export const testChatGPTConnection = async (apiKey: string) => {
  if (!apiKey) return false;

  try {
    console.log("测试ChatGPT API连接...");
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

    const isSuccess = response.ok;
    console.log("ChatGPT API测试结果:", isSuccess ? "成功" : "失败", response.status);
    
    if (!isSuccess) {
      const errorData = await response.json();
      console.error("API测试错误详情:", errorData);
    }
    
    return isSuccess;
  } catch (error) {
    console.error("测试ChatGPT连接失败:", error);
    return false;
  }
};
