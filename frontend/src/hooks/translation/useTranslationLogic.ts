
import { useEffect } from "react";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationTimer } from "./useTranslationTimer";
import { useTranslationPerformer } from "./useTranslationPerformer";
import { useTranslationRetry } from "./useTranslationRetry";
import { useLLMSettings } from "./useLLMSettings";

interface UseTranslationLogicProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
  setSourceText: (text: string) => void;
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
  lastInputChangeTimeRef: React.MutableRefObject<number>;
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
  isFirstTranslationRef,
  lastInputChangeTimeRef
}: UseTranslationLogicProps) => {
  // 直接用 useLLMSettings 获取 key
  const { llmApiKey } = useLLMSettings();
  
  console.log('[useTranslationLogic] 获取到的 llmApiKey:', llmApiKey ? llmApiKey.substring(0, 4) + '...' : '无');

  // 使用执行翻译逻辑钩子
  const { performTranslation } = useTranslationPerformer({
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
  });
  
  // 使用翻译计时器
  useTranslationTimer({
    getSourceText: () => currentSourceTextRef.current,
    translationTimeoutRef,
    performTranslation,
    dependencies: [sourceLanguage, targetLanguage, llmApiKey, currentLLM, retryCount],
    lastInputChangeTimeRef
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

  // sourceText 变化时，始终同步 currentSourceTextRef
  useEffect(() => {
    currentSourceTextRef.current = sourceText;
  }, [sourceText]);

  useEffect(() => {
    console.log('[useTranslationLogic] sourceText 变化:', sourceText);
  }, [sourceText]);

  return { handleRetryTranslation };
};
