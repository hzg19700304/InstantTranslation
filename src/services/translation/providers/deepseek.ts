
// DeepSeek translation provider

import { toast } from "sonner";
import { getLanguageName } from '../utils';

/**
 * 使用DeepSeek API进行翻译
 */
export const translateWithDeepSeek = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string
) => {
  if (!apiKey) {
    toast.error("请提供DeepSeek API密钥", {
      description: "需要API密钥才能使用DeepSeek进行翻译"
    });
    return "[翻译失败: 缺少API密钥]";
  }
  
  // DeepSeek Chat API端点
  const apiUrl = "https://api.deepseek.com/v1/chat/completions";
  
  // 获取语言的完整名称用于提示词
  const sourceLangName = getLanguageName(sourceLanguage);
  const targetLangName = getLanguageName(targetLanguage);
  
  // 记录请求信息用于调试
  console.log("正在使用DeepSeek进行翻译:", {
    sourceLanguage: sourceLangName,
    targetLanguage: targetLangName,
    textLength: text.length,
    apiKeyLength: apiKey.length
  });
  
  // 构建提示词
  const prompt = `将以下${sourceLangName}文本翻译为${targetLangName}，不要添加任何解释，仅输出翻译结果：\n\n${text}`;
  
  try {
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
      const errorData = await response.json();
      console.error("DeepSeek API错误:", errorData);
      toast.error(`API错误: ${response.status}`, {
        description: errorData.error?.message || "请检查API密钥是否正确"
      });
      return `[翻译失败: API错误 ${response.status}]`;
    }
    
    const result = await response.json();
    console.log("DeepSeek API返回成功");
    return result.choices && result.choices.length > 0 ? 
      result.choices[0].message.content : "[翻译失败: 无返回结果]";
  } catch (error) {
    console.error("DeepSeek翻译错误:", error);
    toast.error("翻译失败", {
      description: "连接DeepSeek API时出错，请检查网络连接"
    });
    return "[翻译失败: 连接错误]";
  }
};

/**
 * 测试DeepSeek API连接
 */
export const testDeepSeekConnection = async (apiKey: string) => {
  if (!apiKey) return false;
  
  try {
    console.log("测试DeepSeek API连接...");
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
    
    const isSuccess = response.ok;
    console.log("DeepSeek API测试结果:", isSuccess ? "成功" : "失败", response.status);
    
    if (!isSuccess) {
      const errorData = await response.json();
      console.error("API测试错误详情:", errorData);
    }
    
    return isSuccess;
  } catch (error) {
    console.error("DeepSeek API连接测试失败:", error);
    return false;
  }
};
