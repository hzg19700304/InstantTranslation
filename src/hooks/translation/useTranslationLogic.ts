
import { useEffect } from "react";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationTimer } from "./useTranslationTimer";
import { useTranslationPerformer } from "./useTranslationPerformer";
import { useTranslationRetry } from "./useTranslationRetry";

interface UseTranslationLogicProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
  setSourceText: (text: string) => void;
  llmApiKey: string;
  currentLLM: LLMProvider;
  retryCount: number;
  setRetryCount: (value: number | ((prevCount: number) => number)) => void;
  addToTranslationHistory: (sourceText: string, translatedText: string, isComplete?: boolean) => void;
  updateLatestHistoryItemStatus: (isComplete: boolean) => void;
  
  // 引用
  lastTranslatedTextRef: React.MutableRefObject<string>;
  currentSourceTextRef: React.MutableRefObject<string>;
  translationTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  translationInProgressRef: React.MutableRefObject<boolean>;
  previousTranslationResultRef: React.MutableRefObject<string>;
  completeTranslationRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
}

export const useTranslationLogic = ({
  sourceText,
  sourceLanguage,
  targetLanguage,
  isTranslating,
  setIsTranslating,
  setTranslatedText,
  setTranslationError,
  setSourceText,
  llmApiKey,
  currentLLM,
  retryCount,
  setRetryCount,
  addToTranslationHistory,
  updateLatestHistoryItemStatus,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationTimeoutRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationLogicProps) => {
  
  // 使用执行翻译逻辑钩子
  const { performTranslation } = useTranslationPerformer({
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
  });
  
  // 使用翻译计时器
  useTranslationTimer({
    sourceText,
    translationTimeoutRef,
    performTranslation,
    dependencies: [sourceLanguage, targetLanguage, llmApiKey, currentLLM, retryCount]
  });
  
  // 使用翻译重试钩子
  const { handleRetryTranslation } = useTranslationRetry({
    lastTranslatedTextRef,
    previousTranslationResultRef,
    completeTranslationRef,
    isFirstTranslationRef,
    setRetryCount
  });

  // 语言或模型改变时，重置上次翻译的文本记录和完整翻译记录
  useEffect(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
  }, [sourceLanguage, targetLanguage, currentLLM]);

  return { handleRetryTranslation };
};
