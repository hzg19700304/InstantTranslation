import { useCallback } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationCore } from "./useTranslationCore";
import { useTranslationValidation } from "./useTranslationValidation";
import { useTranslationExecutor } from "./useTranslationExecutor";
import { useLLMSettings } from "./useLLMSettings";

interface UseTranslationPerformerProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
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
  currentLLM,
  addToTranslationHistory,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationPerformerProps) => {
  // 直接用 useLLMSettings 获取 key
  const { llmApiKey } = useLLMSettings();

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
    const text = currentSourceTextRef.current;
    console.log('[performTranslation] called, sourceText:', text);
    if (!text) {
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    // 验证是否应该执行翻译
    if (!shouldExecuteTranslation(text, sourceLanguage.code)) {
      console.log('[performTranslation] shouldExecuteTranslation=false, 阻止翻译');
      return;
    }
    // 保存当前待翻译的源文本
    currentSourceTextRef.current = text;
    // 设置翻译中状态
    if (!isTranslating) {
      setIsTranslating(true);
    }
    setTranslationError("");
    translationInProgressRef.current = true;
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      await executeTranslation(
        currentSourceTextRef,
        previousTranslationResultRef,
        (text) => {
          setTranslatedText(text);
          console.log('[performTranslation] setTranslatedText:', text);
        },
        (err) => {
          setTranslationError(err);
          console.log('[performTranslation] setTranslationError:', err);
        },
        (src, trans, _isComplete) => {
          const chk = (window as any).__lastCheck;
          const flag = chk?.isComplete ?? true;
          addToTranslationHistory(src, trans, flag);
        }
      );
      console.log('[performTranslation] executeTranslation 执行完毕');
    } catch (err) {
      setTranslationError("翻译失败");
      console.error('[performTranslation] error:', err);
    } finally {
      setIsTranslating(false);
      translationInProgressRef.current = false;
    }
  }, [setIsTranslating, setTranslatedText, setTranslationError, isTranslating, sourceLanguage.code, addToTranslationHistory, currentSourceTextRef, previousTranslationResultRef, translationInProgressRef, completeTranslationRef, isFirstTranslationRef, llmApiKey]);
  
  return { performTranslation };
};
