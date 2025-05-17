
// LLM translation service implementation

import { translateWithHuggingFace, testHuggingFaceConnection } from './providers/huggingface';
import { translateWithDeepSeek, testDeepSeekConnection } from './providers/deepseek';
import { translateWithGemini, testGeminiConnection } from './providers/gemini';
import { LLMProvider } from './types';

/**
 * 大模型翻译功能
 * 支持多种大模型: HuggingFace, DeepSeek, Gemini
 */
export const translateWithLLM = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey?: string,
  modelType: LLMProvider = "huggingface"
): Promise<string> => {
  if (!text) return "";
  if (sourceLanguage === targetLanguage) return text;
  if (!apiKey) return "需要API密钥才能使用大模型翻译";
  
  try {
    switch (modelType) {
      case "huggingface":
        return await translateWithHuggingFace(text, sourceLanguage, targetLanguage, apiKey);
      case "deepseek":
        return await translateWithDeepSeek(text, sourceLanguage, targetLanguage, apiKey);
      case "gemini":
        return await translateWithGemini(text, sourceLanguage, targetLanguage, apiKey);
      default:
        return "不支持的模型类型";
    }
  } catch (error) {
    console.error(`${modelType}翻译错误:`, error);
    return `[${modelType}翻译失败: ${(error as Error).message}]`;
  }
};

/**
 * 测试LLM API连接
 */
export const testLLMConnection = async (apiKey: string, provider: LLMProvider): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    switch (provider) {
      case "huggingface":
        return await testHuggingFaceConnection(apiKey);
      case "deepseek":
        return await testDeepSeekConnection(apiKey);
      case "gemini":
        return await testGeminiConnection(apiKey);
      default:
        return false;
    }
  } catch (error) {
    console.error(`测试${provider}连接失败:`, error);
    return false;
  }
};

/**
 * 获取LLM显示名称
 */
export const getLLMDisplayName = (model: string): string => {
  switch (model) {
    case "huggingface":
      return "HuggingFace";
    case "deepseek":
      return "DeepSeek Chat";
    case "gemini":
      return "Google Gemini";
    default:
      return "未知模型";
  }
};
