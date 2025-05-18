
import { useState, useRef } from "react";
import { Language } from "@/types/translation";

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
  
  // 翻译相关引用
  const lastTranslatedTextRef = useRef<string>("");
  const currentSourceTextRef = useRef<string>("");
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationInProgressRef = useRef<boolean>(false);
  const previousTranslationResultRef = useRef<string>("");
  const completeTranslationRef = useRef<string>("");
  const isFirstTranslationRef = useRef<boolean>(true);

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
