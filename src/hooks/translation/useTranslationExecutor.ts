
import { useCallback } from "react";
import { toast } from "sonner";
import { isInputComplete } from "@/services/translation/completeness";
import { Language } from "@/types/translation";

interface UseTranslationExecutorProps {
  sourceText: string;
  sourceLanguage: Language;
  llmApiKey: string;
  lastTranslatedTextRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
  completeTranslationRef: React.MutableRefObject<string>;
  processIncrementalTranslation: (
    textToTranslate: string,
    isIncremental: boolean,
    completeTranslation: string
  ) => Promise<string>;
}

/**
 * 处理翻译执行的核心逻辑
 */
export const useTranslationExecutor = ({
  sourceText,
  sourceLanguage,
  llmApiKey,
  lastTranslatedTextRef,
  isFirstTranslationRef,
  completeTranslationRef,
  processIncrementalTranslation
}: UseTranslationExecutorProps) => {
  
  // 执行翻译并处理结果
  const executeTranslation = useCallback(async (
    currentSourceTextRef: React.MutableRefObject<string>,
    previousTranslationResultRef: React.MutableRefObject<string>,
    setTranslatedText: (text: string) => void,
    setTranslationError: (error: string) => void,
    addToTranslationHistory: (sourceText: string, translatedText: string, isComplete?: boolean) => void
  ): Promise<void> => {
    try {
      // 检查源文本是否完整
      const isInputCompleteFlag = isInputComplete(sourceText, sourceLanguage.code);
      
      // 确定要翻译的文本
      let textToTranslate = sourceText;
      let isIncremental = false;
      
      console.log("进行翻译:", { 
        文本: textToTranslate,
        语言: sourceLanguage.code,
        是否完整输入: isInputCompleteFlag
      });
      
      // 执行翻译并获取结果
      const translationResult = await processIncrementalTranslation(
        textToTranslate,
        isIncremental,
        completeTranslationRef.current
      );
      
      // 处理翻译结果
      if (translationResult === "[翻译失败]") {
        setTranslationError("翻译服务暂时不可用，请稍后再试");
      } else {
        setTranslationError("");
        
        // 确认当前源文本没有变化，然后再更新翻译结果
        if (currentSourceTextRef.current === sourceText) {
          // 保存完整的翻译结果
          completeTranslationRef.current = translationResult;
          
          // 更新上一次翻译结果引用
          previousTranslationResultRef.current = translationResult;
          
          // 设置翻译文本，显示给用户
          setTranslatedText(translationResult);
          
          // 评估翻译结果的质量和完整性
          const translationQuality = evaluateTranslationQuality(sourceText, translationResult, isInputCompleteFlag);
          
          if (translationQuality.isValueable) {
            // 只有当翻译结果有足够价值时才添加到历史记录，并标记是否完整
            addToTranslationHistory(sourceText, translationResult, isInputCompleteFlag);
          }
          
          // 更新最后翻译的文本引用
          lastTranslatedTextRef.current = sourceText;
          isFirstTranslationRef.current = false;
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或检查API密钥"
      });
      return;
    }
  }, [sourceText, sourceLanguage, processIncrementalTranslation, llmApiKey, lastTranslatedTextRef, isFirstTranslationRef, completeTranslationRef]);

  return { executeTranslation };
};

// 评估翻译结果的质量和完整性
const evaluateTranslationQuality = (
  sourceText: string, 
  translationResult: string, 
  isInputCompleteFlag: boolean
) => {
  const minSourceLength = 6; // 降低源文本长度要求
  const minTranslationLength = 4; // 降低翻译结果长度要求
  
  // 检查是否含有明显的不完整翻译标志
  const hasIncompleteMarkers = 
    translationResult.includes("翻译中...") || 
    translationResult.includes("...") || 
    translationResult.length < sourceText.length / 6;
  
  // 判断翻译是否有足够价值添加到历史记录
  const isValueableTranslation = 
    sourceText.trim().length > minSourceLength && 
    translationResult.trim().length > minTranslationLength && 
    !hasIncompleteMarkers &&
    // 翻译结果至少要有源文本长度的15%
    translationResult.length >= sourceText.length * 0.15;
    
  return {
    isValueable: isValueableTranslation,
    isComplete: isInputCompleteFlag && !hasIncompleteMarkers
  };
};
