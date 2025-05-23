
import { useCallback } from "react";
import { Language } from "@/types/translation";

interface UseLanguageSwapProps {
  sourceLanguage: Language;
  setSourceLanguage: (language: Language) => void;
  targetLanguage: Language;
  setTargetLanguage: (language: Language) => void;
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  setTranslatedText: (text: string) => void;
}

export const useLanguageSwap = ({
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  sourceText,
  setSourceText,
  translatedText,
  setTranslatedText
}: UseLanguageSwapProps) => {
  // 语言交换功能
  const handleSwapLanguages = useCallback(() => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // 同时交换文本
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }, [sourceLanguage, targetLanguage, sourceText, translatedText, setSourceLanguage, setTargetLanguage, setSourceText, setTranslatedText]);

  return { handleSwapLanguages };
};
