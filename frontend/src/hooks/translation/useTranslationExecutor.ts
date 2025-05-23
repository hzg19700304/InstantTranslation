import { useCallback } from "react";
import { toast } from "sonner";
import { isInputComplete } from "@/services/translation/completeness";
import { Language } from "@/types/translation";
import { useLLMSettings } from "@/hooks/translation/useLLMSettings";

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
  // 集成全局 LLM 设置
  const { currentLLM, llmApiKey: globalApiKey } = useLLMSettings();

  console.log('[useTranslationExecutor] llmApiKey:', llmApiKey, 'globalApiKey:', globalApiKey, 'currentLLM:', currentLLM);

  // 执行翻译并处理结果
  const executeTranslation = useCallback(async (
    currentSourceTextRef: React.MutableRefObject<string>,
    previousTranslationResultRef: React.MutableRefObject<string>,
    setTranslatedText: (text: string) => void,
    setTranslationError: (error: string) => void,
    addToTranslationHistory: (sourceText: string, translatedText: string, isComplete?: boolean) => void
  ): Promise<void> => {
    try {
      console.log('[executeTranslation] 发起后端API请求:', { 
        文本: sourceText,
        语言: sourceLanguage.code,
        是否完整输入: await isInputComplete(
          sourceText,
          sourceLanguage.code,
          globalApiKey,
          currentLLM
        )
      });
      
      // 检查源文本是否完整，自动带上 provider 和 API Key
      const isInputCompleteFlag = await isInputComplete(
        sourceText,
        sourceLanguage.code,
        globalApiKey,
        currentLLM
      );
      
      // 确定要翻译的文本
      let textToTranslate = sourceText;
      let isIncremental = false;
      
      console.log("进行翻译:", { 
        文本: textToTranslate,
        语言: sourceLanguage.code,
        是否完整输入: isInputCompleteFlag
      });
      
      // 执行翻译并获取结果
      console.log('[useTranslationExecutor] 调用 processIncrementalTranslation 入参:', {
        textToTranslate,
        isIncremental,
        completeTranslation: completeTranslationRef.current
      });
      const translationResult = await processIncrementalTranslation(
        textToTranslate,
        isIncremental,
        completeTranslationRef.current
      );
      console.log('[useTranslationExecutor] processIncrementalTranslation 返回:', translationResult);
      
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
          console.log('[useTranslationExecutor] setTranslatedText 即将写入:', translationResult, '源文本:', sourceText);
          setTranslatedText(translationResult);
          console.log('[useTranslationExecutor] setTranslatedText 已写入:', translationResult);
          
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
      console.error('[useTranslationExecutor] Translation error:', error);
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或检查API密钥"
      });
      return;
    }
  }, [sourceText, sourceLanguage, processIncrementalTranslation, llmApiKey, lastTranslatedTextRef, isFirstTranslationRef, completeTranslationRef, currentLLM, globalApiKey]);

  return { executeTranslation };
};

// 评估翻译结果的质量和完整性
const evaluateTranslationQuality = (
  sourceText: string, 
  translationResult: string, 
  isInputCompleteFlag: boolean
) => {
  const minSourceLength = 1; // 允许单词也被计入历史
  const minTranslationLength = 1; // 允许任意长度的翻译结果
  
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
