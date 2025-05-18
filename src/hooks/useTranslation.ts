
import { useTranslationState } from "./translation/useTranslationState";
import { useLLMSettings } from "./translation/useLLMSettings";
import { useLanguageSwap } from "./translation/useLanguageSwap";
import { useTranslationLogic } from "./translation/useTranslationLogic";
import { Language } from "@/types/translation";

interface UseTranslationProps {
  initialSourceLanguage: Language;
  initialTargetLanguage: Language;
}

export const useTranslation = ({ 
  initialSourceLanguage,
  initialTargetLanguage
}: UseTranslationProps) => {
  // 使用提取的钩子
  const state = useTranslationState({ 
    initialSourceLanguage, 
    initialTargetLanguage 
  });
  
  const llmSettings = useLLMSettings();
  
  const { handleSwapLanguages } = useLanguageSwap({
    sourceLanguage: state.sourceLanguage,
    setSourceLanguage: state.setSourceLanguage,
    targetLanguage: state.targetLanguage,
    setTargetLanguage: state.setTargetLanguage,
    sourceText: state.sourceText,
    setSourceText: state.setSourceText,
    translatedText: state.translatedText,
    setTranslatedText: state.setTranslatedText
  });
  
  const { handleRetryTranslation } = useTranslationLogic({
    sourceText: state.sourceText,
    sourceLanguage: state.sourceLanguage,
    targetLanguage: state.targetLanguage,
    isTranslating: state.isTranslating,
    setIsTranslating: state.setIsTranslating,
    setTranslatedText: state.setTranslatedText,
    setTranslationError: state.setTranslationError,
    useLLM: llmSettings.useLLM,
    llmApiKey: llmSettings.llmApiKey,
    currentLLM: llmSettings.currentLLM,
    retryCount: state.retryCount,
    
    // 引用
    lastTranslatedTextRef: state.lastTranslatedTextRef,
    currentSourceTextRef: state.currentSourceTextRef,
    translationTimeoutRef: state.translationTimeoutRef,
    translationInProgressRef: state.translationInProgressRef,
    previousTranslationResultRef: state.previousTranslationResultRef,
    completeTranslationRef: state.completeTranslationRef,
    isFirstTranslationRef: state.isFirstTranslationRef
  });

  return {
    // 状态导出
    sourceText: state.sourceText,
    setSourceText: state.setSourceText,
    translatedText: state.translatedText,
    setTranslatedText: state.setTranslatedText,
    sourceLanguage: state.sourceLanguage,
    setSourceLanguage: state.setSourceLanguage,
    targetLanguage: state.targetLanguage,
    setTargetLanguage: state.setTargetLanguage,
    isTranslating: state.isTranslating,
    translationError: state.translationError,
    
    // LLM 设置导出
    useLLM: llmSettings.useLLM,
    setUseLLM: llmSettings.setUseLLM,
    llmApiKey: llmSettings.llmApiKey,
    setLlmApiKey: llmSettings.setLlmApiKey,
    showApiKeyInput: llmSettings.showApiKeyInput,
    setShowApiKeyInput: llmSettings.setShowApiKeyInput,
    currentLLM: llmSettings.currentLLM,
    setCurrentLLM: llmSettings.setCurrentLLM,
    saveApiKey: llmSettings.saveApiKey,
    
    // 功能导出
    handleSwapLanguages,
    handleRetryTranslation
  };
};
