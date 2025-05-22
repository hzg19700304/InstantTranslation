
import { useCallback } from "react";
import { toast } from "sonner";
import { shouldTranslate } from "@/services/translation/completeness";

interface UseTranslationValidationProps {
  llmApiKey: string;
  lastTranslatedTextRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
}

/**
 * 处理翻译验证逻辑
 */
export const useTranslationValidation = ({
  llmApiKey,
  lastTranslatedTextRef,
  isFirstTranslationRef
}: UseTranslationValidationProps) => {
  
  // 验证源文本是否应该被翻译
  const shouldExecuteTranslation = useCallback((
    sourceText: string,
    sourceLanguageCode: string
  ): boolean => {
    if (!sourceText) {
      return false;
    }
    
    // 使用智能完整性判断逻辑
    if (!shouldTranslate(
      sourceText, 
      sourceLanguageCode, 
      lastTranslatedTextRef.current,
      isFirstTranslationRef.current
    )) {
      return false; // 不触发翻译
    }
    
    if (!llmApiKey) {
      toast.error("翻译需要API密钥", {
        description: "请在设置中配置大模型API密钥"
      });
      return false;
    }
    
    return true;
  }, [llmApiKey, lastTranslatedTextRef, isFirstTranslationRef]);
  
  return { shouldExecuteTranslation };
};
