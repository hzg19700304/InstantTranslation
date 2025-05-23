
import { useTranslationState, TranslationHistoryItem } from "./translation/useTranslationState";
import { useLLMSettings } from "@/hooks/translation/useLLMSettings";
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
  // 使用提取的钩子 - 注意保持hooks的调用顺序
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
    setSourceText: state.setSourceText, // 传递setSourceText函数以清空输入框
    llmApiKey: llmSettings.llmApiKey,
    currentLLM: llmSettings.currentLLM,
    retryCount: state.retryCount,
    setRetryCount: state.setRetryCount,
    addToTranslationHistory: state.addToTranslationHistory,
    updateLatestHistoryItemStatus: state.updateLatestHistoryItemStatus,
    
    // 引用
    lastTranslatedTextRef: state.lastTranslatedTextRef,
    currentSourceTextRef: state.currentSourceTextRef,
    translationTimeoutRef: state.translationTimeoutRef,
    translationInProgressRef: state.translationInProgressRef,
    previousTranslationResultRef: state.previousTranslationResultRef,
    completeTranslationRef: state.completeTranslationRef,
    isFirstTranslationRef: state.isFirstTranslationRef
  });

  // 判断翻译是否完整 (不在翻译中且已标记为完整)
  const isTranslationComplete = !state.isTranslating && state.translationHistory.length > 0 && 
    (state.translationHistory[0]?.sourceText === state.sourceText) && 
    state.translationHistory[0]?.isComplete;

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
    
    // 翻译完整性状态
    isTranslationComplete,
    
    // 翻译历史
    translationHistory: state.translationHistory,
    clearHistory: state.clearHistory,
    
    // 清空翻译
    clearTranslation: state.clearTranslation,
    
    // LLM 设置导出
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
