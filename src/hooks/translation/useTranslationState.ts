
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
  
  // 翻译历史记录，带有翻译状态标记，减少存储数量至10条
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  
  // 翻译相关引用
  const lastTranslatedTextRef = useRef<string>("");
  const currentSourceTextRef = useRef<string>("");
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationInProgressRef = useRef<boolean>(false);
  const previousTranslationResultRef = useRef<string>("");
  const completeTranslationRef = useRef<string>("");
  const isFirstTranslationRef = useRef<boolean>(true);

  // 添加一个新的翻译结果到历史记录，带有确定性标记，并根据上下文进行整合
  const addToTranslationHistory = (sourceText: string, translatedText: string, isComplete: boolean = true) => {
    if (sourceText && translatedText && translatedText !== "[翻译失败]") {
      setTranslationHistory(prev => {
        // 检查是否有高度相似的翻译，避免重复添加
        const isDuplicate = prev.some(item => {
          // 检查源文本相似性
          const isSourceSimilar = 
            item.sourceText === sourceText || 
            (item.sourceText.length > 5 && 
             (sourceText.includes(item.sourceText) || item.sourceText.includes(sourceText)));
          
          // 检查翻译结果相似性
          const isTranslationSimilar = 
            item.translatedText === translatedText || 
            (item.translatedText.length > 5 && 
             (translatedText.includes(item.translatedText) || item.translatedText.includes(translatedText)));
          
          // 两者都相似则认为是重复的，或者是上下文相关的
          return isSourceSimilar && isTranslationSimilar;
        });
        
        // 如果是重复的或上下文相关的，更新现有项而不是添加新项
        if (isDuplicate) {
          return prev.map(item => {
            // 检查当前项是否与新项内容相似
            const isSourceSimilar = 
              item.sourceText === sourceText || 
              (item.sourceText.length > 5 && 
               (sourceText.includes(item.sourceText) || item.sourceText.includes(sourceText)));
            
            const isTranslationSimilar = 
              item.translatedText === translatedText || 
              (item.translatedText.length > 5 && 
               (translatedText.includes(item.translatedText) || item.translatedText.includes(translatedText)));
            
            // 如果这一项与新项相似，更新为新内容
            if (isSourceSimilar && isTranslationSimilar) {
              // 保留较长/较完整的内容
              const newSourceText = sourceText.length > item.sourceText.length ? sourceText : item.sourceText;
              const newTranslatedText = translatedText.length > item.translatedText.length ? translatedText : item.translatedText;
              
              return {
                ...item,
                sourceText: newSourceText,
                translatedText: newTranslatedText,
                timestamp: new Date(), // 更新时间戳
                isComplete: isComplete || item.isComplete // 保持完整性标记
              };
            }
            return item;
          });
        }
        
        // 不是重复的，添加到历史记录前面
        return [
          {
            sourceText,
            translatedText,
            timestamp: new Date(),
            isComplete
          },
          ...prev.slice(0, 9) // 只保留最近的10条记录（新的 + 前9条）
        ];
      });
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
