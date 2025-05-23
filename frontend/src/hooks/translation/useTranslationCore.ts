
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
      console.log('[executeTranslation] 开始翻译:', { 
        文本长度: textToTranslate.length,
        源语言: sourceLanguageCode,
        目标语言: targetLanguageCode,
        LLM提供商: currentLLM,
        是否首次翻译: isFirstTranslation,
        时间戳: new Date().toISOString() 
      });
      
      if (!llmApiKey && currentLLM !== "huggingface") {
        console.error('[executeTranslation] 缺少API密钥', { 当前LLM提供商: currentLLM });
        toast.error("缺少API密钥", {
          description: "请在设置中配置大模型API密钥"
        });
        return "[翻译失败: 缺少API密钥]";
      }
      
      console.log('[executeTranslation] 准备发送到后端API:', { 
        源语言: sourceLanguageCode, 
        目标语言: targetLanguageCode,
        LLM提供商: currentLLM,
        hasApiKey: !!llmApiKey
      });
      
      const startTime = performance.now();
      
      const requestPayload = {
        source_text: textToTranslate,
        source_language: sourceLanguageCode,
        target_language: targetLanguageCode,
        llm_api_key: llmApiKey,
        llm_provider: currentLLM
      };
      
      console.log('[executeTranslation] 发送翻译请求:', {
        url: "/api/translation/",
        method: "POST",
        源文本长度: textToTranslate.length,
        携带API密钥: !!llmApiKey
      });
      
      const response = await fetch("/api/translation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });
      
      const endTime = performance.now();
      console.log('[executeTranslation] 翻译请求响应状态:', { 
        status: response.status, 
        ok: response.ok,
        耗时: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[executeTranslation] 翻译请求失败:', errorData);
        toast.error("翻译服务暂时不可用", {
          description: errorData.detail || "请检查API密钥是否正确或稍后重试"
        });
        return "[翻译失败]";
      }
      
      const data = await response.json();
      console.log("[executeTranslation] 翻译API响应内容:", {
        结果长度: data.translated_text?.length || 0,
        成功: !!data.translated_text,
        耗时: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      if (!data.translated_text) {
        console.error('[executeTranslation] 翻译结果为空');
        return "[翻译失败: 结果为空]";
      }
      
      return data.translated_text;
    } catch (error) {
      console.error("[executeTranslation] 翻译出错:", error);
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
    console.log('[processIncrementalTranslation] 开始处理:', {
      文本长度: textToTranslate.length,
      是否增量翻译: isIncremental,
      已有完整翻译长度: completeTranslation?.length || 0
    });
    
    const startTime = performance.now();
    const result = await executeTranslation(textToTranslate);
    const endTime = performance.now();
    
    console.log('[processIncrementalTranslation] 翻译完成:', {
      结果长度: result?.length || 0,
      耗时: `${(endTime - startTime).toFixed(2)}ms`,
      是否失败: result.includes('[翻译失败]')
    });
    
    if (result.includes('[翻译失败]')) {
      return result;
    }
    
    if (isIncremental && completeTranslation) {
      const combinedResult = `${completeTranslation} ${result}`.trim();
      console.log('[processIncrementalTranslation] 合并增量翻译结果:', {
        最终长度: combinedResult.length
      });
      return combinedResult;
    } else {
      return result;
    }
  }, [executeTranslation]);

  return {
    executeTranslation,
    processIncrementalTranslation
  };
};
