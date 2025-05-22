
import { useCallback } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationCore } from "./useTranslationCore";
import { useTranslationValidation } from "./useTranslationValidation";
import { useTranslationExecutor } from "./useTranslationExecutor";

interface UseTranslationPerformerProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
  llmApiKey: string;
  currentLLM: LLMProvider;
  addToTranslationHistory: (sourceText: string, translatedText: string, isComplete?: boolean) => void;
  
  // 引用
  lastTranslatedTextRef: React.MutableRefObject<string>;
  currentSourceTextRef: React.MutableRefObject<string>;
  translationInProgressRef: React.MutableRefObject<boolean>;
  previousTranslationResultRef: React.MutableRefObject<string>;
  completeTranslationRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
}

/**
 * 处理翻译执行的核心逻辑
 */
export const useTranslationPerformer = ({
  sourceText,
  sourceLanguage,
  targetLanguage,
  isTranslating,
  setIsTranslating,
  setTranslatedText,
  setTranslationError,
  llmApiKey,
  currentLLM,
  addToTranslationHistory,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationPerformerProps) => {
  
  // 获取核心翻译功能
  const { processIncrementalTranslation } = useTranslationCore({
    sourceText,
    sourceLanguageCode: sourceLanguage.code,
    targetLanguageCode: targetLanguage.code,
    llmApiKey,
    currentLLM,
    isFirstTranslation: isFirstTranslationRef.current,
    previousTranslationText: previousTranslationResultRef.current
  });
  
  // 获取翻译验证功能
  const { shouldExecuteTranslation } = useTranslationValidation({
    llmApiKey,
    lastTranslatedTextRef,
    isFirstTranslationRef
  });
  
  // 获取翻译执行功能
  const { executeTranslation } = useTranslationExecutor({
    sourceText,
    sourceLanguage,
    llmApiKey,
    lastTranslatedTextRef,
    isFirstTranslationRef,
    completeTranslationRef,
    processIncrementalTranslation
  });
  
  // 执行翻译
  const performTranslation = useCallback(async () => {
    if (!sourceText) {
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    
    // 验证是否应该执行翻译
    if (!shouldExecuteTranslation(sourceText, sourceLanguage.code)) {
      return;
    }
    
    // 保存当前待翻译的源文本
    currentSourceTextRef.current = sourceText;
    
    // 设置翻译中状态
    if (!isTranslating) {
      setIsTranslating(true);
    }
    setTranslationError("");
    translationInProgressRef.current = true;
    
    // 减少延迟，更快开始翻译
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 再次检查源文本是否已经改变
    if (currentSourceTextRef.current !== sourceText) {
      setIsTranslating(false);
      translationInProgressRef.current = false;
      return;
    }
    
    // 执行翻译
    await executeTranslation(
      currentSourceTextRef,
      previousTranslationResultRef,
      setTranslatedText,
      setTranslationError,
      addToTranslationHistory
    );
    
    // 确认当前源文本没有变化，才结束翻译状态
    if (currentSourceTextRef.current === sourceText) {
      setIsTranslating(false);
      translationInProgressRef.current = false;
    }
  }, [
    sourceText, 
    sourceLanguage, 
    isTranslating, 
    setIsTranslating, 
    setTranslatedText,
    setTranslationError, 
    shouldExecuteTranslation,
    executeTranslation,
    addToTranslationHistory,
    currentSourceTextRef,
    translationInProgressRef,
    previousTranslationResultRef
  ]);
  
  return { performTranslation };
};
