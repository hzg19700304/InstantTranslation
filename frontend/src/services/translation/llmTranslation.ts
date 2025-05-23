// @AI-Generated
// 此文件的AI相关实现已迁移到后端，仅保留占位符，防止误用。

// Re-export from different providers
import { translateWithHuggingFace } from './providers/huggingface';
import { translateWithDeepSeek } from './providers/deepseek';
import { translateWithGemini } from './providers/gemini';
import { translateWithChatGPT } from './providers/chatgpt';
//import { testHuggingFaceConnection } from './providers/huggingface';
//import { testGeminiConnection } from './providers/gemini';
//import { testChatGPTConnection } from './providers/chatgpt';
import { LLMProvider } from './types';

/**
 * @AI-Generated
 * translateWithLLM 已迁移到后端服务，请通过后端API调用。
 */
export const translateWithLLM = async () => {
  throw new Error('translateWithLLM 已迁移到后端服务，请通过后端API调用。');
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

