import { useCallback } from "react";
import { toast } from "sonner";
import { shouldTranslateEx } from "@/services/translation/completeness";
import { useLLMSettings } from './useLLMSettings';

interface UseTranslationValidationProps {
  lastTranslatedTextRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
}

/**
 * 处理翻译验证逻辑
 */
export const useTranslationValidation = ({
  lastTranslatedTextRef,
  isFirstTranslationRef
}: UseTranslationValidationProps) => {
  const { llmApiKey, currentLLM } = useLLMSettings();
  
  // 验证源文本是否应该被翻译
  const shouldExecuteTranslation = useCallback(async (
    sourceText: string,
    sourceLanguageCode: string
  ): Promise<boolean> => {
    if (!sourceText) {
      return false;
    }
    
    // 使用新的停顿/完整性检测
    const start = Date.now();
    const should = await shouldTranslateEx(
      sourceText,
      sourceLanguageCode,
      lastTranslatedTextRef.current,
      isFirstTranslationRef.current,
      llmApiKey,
      currentLLM
    );
    console.log("翻译耗时:", (Date.now() - start) / 1000, "秒");

    (window as any).__lastCheck = should; // 暂存供后续钩子使用

    if (!should) {
      return false; // 不触发翻译
    }
    
    if (!llmApiKey) {
      toast.error("翻译需要API密钥", {
        description: "请在设置中配置大模型API密钥"
      });
      return false;
    }
    
    return true;
  }, [llmApiKey, lastTranslatedTextRef, isFirstTranslationRef, currentLLM]);
  
  return { shouldExecuteTranslation };
};
