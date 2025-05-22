
import { useState, useRef } from "react";
import { Language } from "@/types/translation";

export interface TranslationHistoryItem {
  sourceText: string;
  translatedText: string;
  timestamp: Date;
  isComplete: boolean; // 添加标记表示翻译是否完成确定
}

interface UseTranslationStateProps {
  initialSourceLanguage: Language;
  initialTargetLanguage: Language;
}

export const useTranslationState = ({ 
  initialSourceLanguage,
  initialTargetLanguage
}: UseTranslationStateProps) => {
  // 基本状态管理
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>(initialSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<Language>(initialTargetLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  
  // 翻译历史记录，带有翻译状态标记，增加存储数量至50条
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  
  // 翻译相关引用
  const lastTranslatedTextRef = useRef<string>("");
  const currentSourceTextRef = useRef<string>("");
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationInProgressRef = useRef<boolean>(false);
  const previousTranslationResultRef = useRef<string>("");
  const completeTranslationRef = useRef<string>("");
  const isFirstTranslationRef = useRef<boolean>(true);

  // 添加一个新的翻译结果到历史记录，带有确定性标记
  const addToTranslationHistory = (sourceText: string, translatedText: string, isComplete: boolean = true) => {
    if (sourceText && translatedText && translatedText !== "[翻译失败]") {
      setTranslationHistory(prev => [
        {
          sourceText,
          translatedText,
          timestamp: new Date(),
          isComplete
        },
        ...prev.slice(0, 49) // 保留最近的50条记录
      ]);
    }
  };
  
  // 更新最新的翻译历史项的状态
  const updateLatestHistoryItemStatus = (isComplete: boolean) => {
    setTranslationHistory(prev => {
      if (prev.length === 0) return prev;
      
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        isComplete
      };
      
      return updated;
    });
  };
  
  // 添加清空翻译功能
  const clearTranslation = () => {
    setSourceText("");
    setTranslatedText("");
    setTranslationError("");
    lastTranslatedTextRef.current = "";
    currentSourceTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
  };

  // 清空历史记录
  const clearHistory = () => {
    setTranslationHistory([]);
  };

  return {
    // 状态
    sourceText,
    setSourceText,
    translatedText,
    setTranslatedText,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isTranslating,
    setIsTranslating,
    translationError,
    setTranslationError,
    retryCount,
    setRetryCount,
    
    // 翻译历史
    translationHistory,
    addToTranslationHistory,
    updateLatestHistoryItemStatus,
    clearHistory,
    
    // 清空翻译
    clearTranslation,
    
    // 引用
    lastTranslatedTextRef,
    currentSourceTextRef,
    translationTimeoutRef,
    translationInProgressRef,
    previousTranslationResultRef,
    completeTranslationRef,
    isFirstTranslationRef
  };
};
