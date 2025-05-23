
import { useCallback } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { useTranslationCore } from "./useTranslationCore";
import { useTranslationValidation } from "./useTranslationValidation";
import { useTranslationExecutor } from "./useTranslationExecutor";
import { useLLMSettings } from "./useLLMSettings";

interface UseTranslationPerformerProps {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslatedText: (text: string) => void;
  setTranslationError: (error: string) => void;
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
  currentLLM,
  addToTranslationHistory,
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationPerformerProps) => {
  // 直接用 useLLMSettings 获取 key
  const { llmApiKey } = useLLMSettings();
  
  console.log('[useTranslationPerformer] 初始化翻译执行器', {
    源文本长度: sourceText?.length || 0,
    源语言: sourceLanguage?.code,
    目标语言: targetLanguage?.code,
    LLM提供商: currentLLM,
    API密钥: llmApiKey ? `${llmApiKey.substring(0, 4)}...` : '无',
    是否翻译中: isTranslating,
    时间戳: new Date().toISOString()
  });

  // 获取核心翻译功能
  const { processIncrementalTranslation } = useTranslationCore({
    sourceText,
    sourceLanguageCode: sourceLanguage.code,
    targetLanguageCode: targetLanguage.code,
    llmApiKey, // 确保这里传递了API密钥
    currentLLM,
    isFirstTranslation: isFirstTranslationRef.current,
    previousTranslationText: previousTranslationResultRef.current
  });
  
  // 获取翻译验证功能
  const { shouldExecuteTranslation } = useTranslationValidation({
    lastTranslatedTextRef,
    isFirstTranslationRef
  });
  
  // 获取翻译执行功能
  const { executeTranslation } = useTranslationExecutor({
    sourceText,
    sourceLanguage,
    llmApiKey, // 确保这里传递了API密钥
    lastTranslatedTextRef,
    isFirstTranslationRef,
    completeTranslationRef,
    processIncrementalTranslation
  });
  
  // 执行翻译
  const performTranslation = useCallback(async () => {
    const text = currentSourceTextRef.current;
    console.log('[performTranslation] 开始执行翻译:', {
      文本长度: text?.length || 0,
      当前API密钥: llmApiKey ? `${llmApiKey.substring(0, 4)}...` : '无',
      LLM提供商: currentLLM,
      时间戳: new Date().toISOString()
    });
    
    if (!text) {
      console.log('[performTranslation] 文本为空，不执行翻译');
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    
    // 验证是否应该执行翻译
    console.log('[performTranslation] 检查是否应执行翻译');
    const shouldExecute = await shouldExecuteTranslation(text, sourceLanguage.code);
    
    if (!shouldExecute) {
      console.log('[performTranslation] 验证未通过，阻止翻译');
      return;
    }
    
    // 保存当前待翻译的源文本
    currentSourceTextRef.current = text;
    
    // 设置翻译中状态
    if (!isTranslating) {
      console.log('[performTranslation] 设置翻译状态为进行中');
      setIsTranslating(true);
    }
    
    setTranslationError("");
    translationInProgressRef.current = true;
    
    console.log('[performTranslation] 设置延迟等待用户停止输入');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      console.log('[performTranslation] 开始执行实际翻译');
      const startTime = performance.now();
      
      await executeTranslation(
        currentSourceTextRef,
        previousTranslationResultRef,
        (text) => {
          console.log('[performTranslation] 更新翻译结果:', { 结果长度: text?.length || 0 });
          setTranslatedText(text);
        },
        (err) => {
          console.log('[performTranslation] 设置翻译错误:', err);
          setTranslationError(err);
        },
        (src, trans, _isComplete) => {
          const chk = (window as any).__lastCheck;
          const flag = chk?.isComplete ?? true;
          console.log('[performTranslation] 添加到翻译历史:', {
            源文本长度: src?.length || 0,
            翻译结果长度: trans?.length || 0,
            是否完整: flag
          });
          addToTranslationHistory(src, trans, flag);
        }
      );
      
      const endTime = performance.now();
      console.log('[performTranslation] 翻译执行完毕', {
        耗时: `${(endTime - startTime).toFixed(2)}ms`
      });
      
    } catch (err) {
      console.error('[performTranslation] 翻译过程出错:', err);
      setTranslationError("翻译失败");
    } finally {
      console.log('[performTranslation] 翻译流程结束，重置状态');
      setIsTranslating(false);
      translationInProgressRef.current = false;
    }
  }, [
    setIsTranslating, 
    setTranslatedText, 
    setTranslationError, 
    isTranslating, 
    sourceLanguage.code, 
    addToTranslationHistory, 
    currentSourceTextRef, 
    previousTranslationResultRef, 
    translationInProgressRef, 
    completeTranslationRef, 
    isFirstTranslationRef, 
    llmApiKey, 
    shouldExecuteTranslation, 
    executeTranslation,
    currentLLM
  ]);
  
  return { performTranslation };
};
