import { useCallback } from "react";
import { toast } from "sonner";

interface UseTranslationCoreProps {
  sourceText: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  llmApiKey: string;
  currentLLM: string;
  isFirstTranslation: boolean;
  previousTranslationText: string;
}

// @AI-Generated
// 如需测试API Key连通性，请使用 test_llm_api.py 脚本，详见后端根目录说明。
// 用法: python test_llm_api.py [provider] [api_key]
// provider: openai | gemini | huggingface | deepseek
// 例如: python test_llm_api.py openai sk-xxxx
//
// 该脚本可快速检测API Key是否可用，排查网络/配额/密钥问题。

/**
 * 核心翻译功能，处理实际的翻译API调用（已迁移到后端）
 */
export const useTranslationCore = ({
  sourceText,
  sourceLanguageCode,
  targetLanguageCode,
  llmApiKey,
  currentLLM,
  isFirstTranslation,
  previousTranslationText
}: UseTranslationCoreProps) => {
  // 调用后端API进行翻译
  const executeTranslation = useCallback(async (textToTranslate: string): Promise<string> => {
    try {
      if (!llmApiKey && currentLLM !== "huggingface") {
        toast.error("缺少API密钥", {
          description: "请在设置中配置大模型API密钥"
        });
        return "[翻译失败: 缺少API密钥]";
      }
      const response = await fetch("/api/translation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source_text: textToTranslate,
          source_language: sourceLanguageCode,
          target_language: targetLanguageCode,
          llm_api_key: llmApiKey,
          llm_provider: currentLLM
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error("翻译服务暂时不可用", {
          description: errorData.detail || "请检查API密钥是否正确或稍后重试"
        });
        return "[翻译失败]";
      }
      const data = await response.json();
      console.log("翻译API响应内容:", data);
      return data.translated_text;
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或检查API密钥"
      });
      return "[翻译失败]";
    }
  }, [sourceLanguageCode, targetLanguageCode, llmApiKey, currentLLM, isFirstTranslation]);

  // 处理增量翻译逻辑
  const processIncrementalTranslation = useCallback(async (
    textToTranslate: string,
    isIncremental: boolean,
    completeTranslation: string
  ): Promise<string> => {
    const result = await executeTranslation(textToTranslate);
    if (result === "[翻译失败]") {
      return result;
    }
    if (isIncremental && completeTranslation) {
      return `${completeTranslation} ${result}`.trim();
    } else {
      return result;
    }
  }, [executeTranslation]);

  return {
    executeTranslation,
    processIncrementalTranslation
  };
};
