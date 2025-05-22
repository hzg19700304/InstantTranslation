
import { useCallback } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { shouldTranslate } from "@/services/translation/completeness";
import { useTranslationCore } from "./useTranslationCore";

interface UseTranslationPerformerProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
  llmApiKey: string;
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
  llmApiKey,
  currentLLM,
  addToTranslationHistory,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationPerformerProps) => {
  
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
  
  // 执行翻译
  const performTranslation = useCallback(async () => {
    if (!sourceText) {
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    
    // 使用智能完整性判断逻辑
    if (!shouldTranslate(
      sourceText, 
      sourceLanguage.code, 
      lastTranslatedTextRef.current,
      isFirstTranslationRef.current
    )) {
      return; // 不触发翻译
    }
    
    if (!llmApiKey) {
      setTranslationError("未配置API密钥，请在设置中配置");
      toast.error("翻译需要API密钥", {
        description: "请在设置中配置大模型API密钥"
      });
      return;
    }
    
    // 保存当前待翻译的源文本
    currentSourceTextRef.current = sourceText;
    
    // 设置翻译中状态
    if (!isTranslating) {
      setIsTranslating(true);
    }
    setTranslationError("");
    translationInProgressRef.current = true;
    
    // 减少延迟，更快开始翻译
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 再次检查源文本是否已经改变
    if (currentSourceTextRef.current !== sourceText) {
      setIsTranslating(false);
      translationInProgressRef.current = false;
      return;
    }
    
    try {
      // 确定要翻译的文本
      let textToTranslate = sourceText;
      let isIncremental = false;
      
      console.log("进行完整翻译:", { 
        文本: textToTranslate,
        语言: sourceLanguage.code
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
          
          // 检查翻译结果是否有意义
          const minSourceLength = 6; // 降低源文本长度要求
          const minTranslationLength = 4; // 降低翻译结果长度要求
          
          // 检查是否含有明显的不完整翻译标志
          const hasIncompleteMarkers = 
            translationResult.includes("翻译中...") || 
            translationResult.includes("...") || 
            translationResult.length < sourceText.length / 6;
          
          if (sourceText.trim().length > minSourceLength && 
              translationResult.trim().length > minTranslationLength && 
              !hasIncompleteMarkers) {
            // 只有当翻译完成且结果有意义时，才添加到历史记录
            addToTranslationHistory(sourceText, translationResult, true);
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
    } finally {
      // 确认当前源文本没有变化，才结束翻译状态
      if (currentSourceTextRef.current === sourceText) {
        setIsTranslating(false);
        translationInProgressRef.current = false;
      }
    }
  }, [
    sourceText, 
    sourceLanguage, 
    targetLanguage, 
    isTranslating, 
    setIsTranslating, 
    setTranslatedText,
    setTranslationError, 
    processIncrementalTranslation,
    addToTranslationHistory,
    llmApiKey
  ]);
  
  return { performTranslation };
};
