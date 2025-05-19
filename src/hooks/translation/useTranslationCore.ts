
import { useCallback } from "react";
import { toast } from "sonner";
import { translateText, translateWithLLM } from "@/services/translation";
import { LLMProvider } from "@/services/translation/types";

interface UseTranslationCoreProps {
  sourceText: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  useLLM: boolean;
  llmApiKey: string;
  currentLLM: LLMProvider;
  isFirstTranslation: boolean;
  previousTranslationText: string;
}

/**
 * 核心翻译功能，处理实际的翻译API调用
 */
export const useTranslationCore = ({
  sourceText,
  sourceLanguageCode,
  targetLanguageCode,
  useLLM,
  llmApiKey,
  currentLLM,
  isFirstTranslation,
  previousTranslationText
}: UseTranslationCoreProps) => {
  
  // 执行翻译API调用，返回翻译结果
  const executeTranslation = useCallback(async (textToTranslate: string): Promise<string> => {
    try {
      console.log("开始翻译", { 
        使用大模型: useLLM, 
        源语言: sourceLanguageCode, 
        目标语言: targetLanguageCode,
        文本长度: textToTranslate.length,
        是否首次翻译: isFirstTranslation
      });
      
      let result;
      if (useLLM && llmApiKey) {
        console.log(`使用${currentLLM}大模型翻译...`);
        result = await translateWithLLM(
          textToTranslate,
          sourceLanguageCode,
          targetLanguageCode,
          llmApiKey,
          currentLLM
        );
      } else {
        // 普通API翻译
        console.log("使用免费API翻译...");
        result = await translateText(
          textToTranslate,
          sourceLanguageCode,
          targetLanguageCode
        );
      }
      
      console.log("翻译结果:", { result: result.substring(0, 50) + (result.length > 50 ? '...' : '') });
      
      // 检查返回结果是否包含错误信息
      if (typeof result === 'string' && result.includes("[翻译失败:")) {
        toast.error("翻译服务暂时不可用", {
          description: "我们正在尝试连接到备用服务器"
        });
        return "[翻译失败]";
      }
      
      return result;
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或切换翻译模式"
      });
      return "[翻译失败]";
    }
  }, [sourceLanguageCode, targetLanguageCode, useLLM, llmApiKey, currentLLM, isFirstTranslation]);

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
      // 对于增量翻译，确保我们是真正地追加新的结果到之前的完整翻译
      return `${completeTranslation} ${result}`.trim();
    } else {
      // 对于全新翻译
      return result;
    }
  }, [executeTranslation]);

  return {
    executeTranslation,
    processIncrementalTranslation
  };
};
