
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationCore } from "./useTranslationCore";
import { useTranslationTimer } from "./useTranslationTimer";

interface UseTranslationLogicProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
  useLLM: boolean;
  llmApiKey: string;
  currentLLM: LLMProvider;
  retryCount: number;
  setRetryCount: (value: number | ((prevCount: number) => number)) => void;
  
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
  useLLM,
  llmApiKey,
  currentLLM,
  retryCount,
  setRetryCount,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationTimeoutRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationLogicProps) => {
  // 获取核心翻译功能 - must be called in every render at the same position
  const { processIncrementalTranslation } = useTranslationCore({
    sourceText,
    sourceLanguageCode: sourceLanguage.code,
    targetLanguageCode: targetLanguage.code,
    useLLM,
    llmApiKey,
    currentLLM,
    isFirstTranslation: isFirstTranslationRef.current,
    previousTranslationText: previousTranslationResultRef.current
  });
  
  // 进行翻译 - define this early to ensure consistent hook order
  const performTranslation = useCallback(async () => {
    if (!sourceText) {
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    
    // 保存当前待翻译的源文本，防止在翻译过程中文本变化导致翻译结果被清空
    currentSourceTextRef.current = sourceText;
    
    // 避免重复翻译相同的文本
    if (sourceText === lastTranslatedTextRef.current && !isFirstTranslationRef.current) {
      return;
    }
    
    // 设置翻译中状态
    if (!isTranslating) {
      setIsTranslating(true);
    }
    setTranslationError("");
    translationInProgressRef.current = true;
    
    try {
      // 确定要翻译的文本
      let textToTranslate = sourceText;
      let isIncremental = false;
      
      // 如果当前文本是之前文本的扩展，只翻译新增部分
      if (lastTranslatedTextRef.current && sourceText.startsWith(lastTranslatedTextRef.current) && !isFirstTranslationRef.current) {
        const newText = sourceText.substring(lastTranslatedTextRef.current.length).trim();
        // 只有当新文本有内容时，才进行增量翻译
        if (newText) {
          textToTranslate = newText;
          isIncremental = true;
          console.log("进行增量翻译:", { 原文本: lastTranslatedTextRef.current.substring(0, 20) + "...", 新增部分: newText });
        }
      }
      
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
          
          // 如果是增量翻译，则更新 previousTranslationResultRef 为新的完整翻译
          previousTranslationResultRef.current = translationResult;
          
          // 设置翻译文本，显示给用户
          setTranslatedText(translationResult);
          
          // 更新最后翻译的文本引用
          lastTranslatedTextRef.current = sourceText;
          isFirstTranslationRef.current = false;
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或切换翻译模式"
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
    processIncrementalTranslation
  ]);
  
  // 使用翻译计时器 - must follow performTranslation
  useTranslationTimer({
    sourceText,
    translationTimeoutRef,
    performTranslation,
    dependencies: [sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, retryCount]
  });

  // 语言或模型改变时，重置上次翻译的文本记录和完整翻译记录
  useEffect(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
  }, [sourceLanguage, targetLanguage, useLLM, currentLLM]);

  // 手动重试翻译功能
  const handleRetryTranslation = useCallback(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
    setRetryCount(prevCount => prevCount + 1);
    toast.info("正在重试翻译", {
      description: "尝试连接到备用翻译服务器..."
    });
  }, [setRetryCount]);

  return { handleRetryTranslation };
};

