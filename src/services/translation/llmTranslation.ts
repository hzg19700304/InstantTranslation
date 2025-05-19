
// Re-export from different providers
import { translateWithHuggingFace } from './providers/huggingface';
import { translateWithDeepSeek } from './providers/deepseek';
import { translateWithGemini } from './providers/gemini';
import { translateWithChatGPT } from './providers/chatgpt';
import { testHuggingFaceConnection } from './providers/huggingface';
import { testDeepSeekConnection } from './providers/deepseek';
import { testGeminiConnection } from './providers/gemini';
import { testChatGPTConnection } from './providers/chatgpt';
import { LLMProvider } from './types';

/**
 * 通过LLM进行翻译
 */
export const translateWithLLM = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  llmApiKey: string,
  provider: LLMProvider
): Promise<string> => {
  switch (provider) {
    case 'huggingface':
      return await translateWithHuggingFace(text, sourceLanguage, targetLanguage, llmApiKey);
    case 'deepseek':
      return await translateWithDeepSeek(text, sourceLanguage, targetLanguage, llmApiKey);
    case 'gemini':
      return await translateWithGemini(text, sourceLanguage, targetLanguage, llmApiKey);
    case 'chatgpt':
      return await translateWithChatGPT(text, sourceLanguage, targetLanguage, llmApiKey);
    default:
      throw new Error(`不支持的LLM提供者: ${provider}`);
  }
};

/**
 * 测试LLM连接
 */
export const testLLMConnection = async (
  apiKey: string,
  provider: LLMProvider
): Promise<boolean> => {
  switch (provider) {
    case 'huggingface':
      return await testHuggingFaceConnection(apiKey);
    case 'deepseek':
      return await testDeepSeekConnection(apiKey);
    case 'gemini':
      return await testGeminiConnection(apiKey);
    case 'chatgpt':
      return await testChatGPTConnection(apiKey);
    default:
      throw new Error(`不支持的LLM提供者: ${provider}`);
  }
};

/**
 * 获取LLM的显示名称
 */
export const getLLMDisplayName = (provider: string): string => {
  switch (provider) {
    case 'huggingface':
      return 'HuggingFace';
    case 'deepseek':
      return 'DeepSeek Chat';
    case 'gemini':
      return 'Google Gemini';
    case 'chatgpt':
      return 'ChatGPT';
    default:
      return provider || '未知模型';
  }
};

