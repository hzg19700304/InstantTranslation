
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
  llmApiKey: string;
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
}

export const useTranslationLogic = ({
  sourceText,
  sourceLanguage,
  targetLanguage,
  isTranslating,
  setIsTranslating,
  setTranslatedText,
  setTranslationError,
  llmApiKey,
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
  isFirstTranslationRef
}: UseTranslationLogicProps) => {
  // 获取核心翻译功能 - must be called in every render at the same position
  const { processIncrementalTranslation } = useTranslationCore({
    sourceText,
    sourceLanguageCode: sourceLanguage.code,
    targetLanguageCode: targetLanguage.code,
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
    
    // 加强检查短文本和正在输入中的文本的判断逻辑
    // 1. 字数太少的不触发翻译
    if (sourceText.trim().length <= 5) {
      return; // 不触发翻译，等待用户输入更多
    }
    
    // 2. 检查是否以不完整的标点符号结尾（可能表示用户正在输入）
    const lastChar = sourceText.trim().slice(-1);
    const incompleteEndingChars = ['(', '[', '{', '"', "'", '，', '：', '；', '、', '…'];
    if (incompleteEndingChars.includes(lastChar)) {
      return; // 不翻译，等待用户完成输入
    }
    
    if (!llmApiKey) {
      setTranslationError("未配置API密钥，请在设置中配置");
      toast.error("翻译需要API密钥", {
        description: "请在设置中配置大模型API密钥"
      });
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
    
    // 增加延迟，给用户更多时间完成输入
    // 这里使用 setTimeout 添加额外延迟
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 再次检查源文本是否已经改变，如果改变则取消当前翻译
    if (currentSourceTextRef.current !== sourceText) {
      // 源文本已改变，用户可能还在输入，取消当前翻译
      setIsTranslating(false);
      translationInProgressRef.current = false;
      return;
    }
    
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
      
      // 不再添加未完成的翻译到历史记录中
      
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
          
          // 如果是增量翻译，则确保更新 previousTranslationResultRef 为新的完整翻译
          previousTranslationResultRef.current = translationResult;
          
          // 设置翻译文本，显示给用户
          setTranslatedText(translationResult);
          
          // 加强检查翻译结果是否有意义 (避免保存不完整或无意义的翻译)
          const minSourceLength = 5; // 增加最小原文长度要求
          const minTranslationLength = 3; // 增加最小翻译结果长度要求
          
          // 检查是否含有明显的不完整翻译标志
          const hasIncompleteMarkers = 
            translationResult.includes("翻译中...") || 
            translationResult.includes("...") || 
            translationResult.length < sourceText.length / 4; // 翻译结果异常短
          
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
  
  // 使用翻译计时器 - must follow performTranslation
  useTranslationTimer({
    sourceText,
    translationTimeoutRef,
    performTranslation,
    dependencies: [sourceLanguage, targetLanguage, llmApiKey, currentLLM, retryCount]
  });

  // 语言或模型改变时，重置上次翻译的文本记录和完整翻译记录
  useEffect(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
  }, [sourceLanguage, targetLanguage, currentLLM]);

  // 手动重试翻译功能
  const handleRetryTranslation = useCallback(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
    setRetryCount(prevCount => prevCount + 1);
    toast.info("正在重试翻译", {
      description: "尝试重新连接翻译服务..."
    });
  }, [setRetryCount]);

  return { handleRetryTranslation };
};
