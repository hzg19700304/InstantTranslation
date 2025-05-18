
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { translateText, translateWithLLM } from "@/services/translation";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";

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
  lastTranslatedTextRef,
  currentSourceTextRef,
  translationTimeoutRef,
  translationInProgressRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef
}: UseTranslationLogicProps) => {
  // 进行翻译
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
        }
      }
      
      // 第一次翻译时保留现有的翻译结果
      const currentTranslationResult = isFirstTranslationRef.current ? "" : "";
      
      // 执行翻译
      let result;
      if (useLLM && llmApiKey) {
        result = await translateWithLLM(
          textToTranslate,
          sourceLanguage.code,
          targetLanguage.code,
          llmApiKey,
          currentLLM
        );
      } else {
        result = await translateText(
          textToTranslate,
          sourceLanguage.code,
          targetLanguage.code
        );
      }
      
      // 检查返回结果是否包含错误信息
      if (result.includes("[翻译失败:")) {
        setTranslationError("翻译服务暂时不可用，请稍后再试");
        toast.error("翻译服务暂时不可用", {
          description: "我们正在尝试连接到备用服务器"
        });
      } else {
        setTranslationError("");
        
        // 确认当前源文本没有变化，然后再更新翻译结果
        if (currentSourceTextRef.current === sourceText) {
          if (isIncremental) {
            // 对于增量翻译，追加新的翻译结果
            const newTranslation = completeTranslationRef.current ? 
              `${completeTranslationRef.current} ${result}`.trim() : 
              result;
            
            completeTranslationRef.current = newTranslation;
            setTranslatedText(newTranslation);
            previousTranslationResultRef.current = newTranslation;
          } else {
            // 对于全新翻译
            completeTranslationRef.current = result;
            previousTranslationResultRef.current = result;
            setTranslatedText(result);
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
        description: "无法完成翻译，请稍后再试或切换翻译模式"
      });
    } finally {
      // 确认当前源文本没有变化，才结束翻译状态
      if (currentSourceTextRef.current === sourceText) {
        setIsTranslating(false);
        translationInProgressRef.current = false;
      }
    }
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, isTranslating, setIsTranslating, setTranslatedText, setTranslationError]);

  // 监听文本变化，延迟自动翻译，防止频繁更新导致翻译结果闪烁
  useEffect(() => {
    // 取消之前的计时器
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    // 设置新的计时器，减少延迟时间，提高响应速度
    translationTimeoutRef.current = setTimeout(() => {
      performTranslation();
    }, 800); // 将延迟时间从1500ms减少到800ms，提高响应速度
    
    // 组件卸载时清理计时器
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, performTranslation, retryCount]);

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
    toast.info("正在重试翻译", {
      description: "尝试连接到备用翻译服务器..."
    });
  }, []);

  return { handleRetryTranslation };
};
