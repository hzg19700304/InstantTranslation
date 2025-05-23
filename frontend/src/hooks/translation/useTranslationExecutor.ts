
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
  const { currentLLM } = useLLMSettings();

  console.log('[useTranslationExecutor] 初始化 useTranslationExecutor', {
    源文本长度: sourceText?.length || 0,
    源语言: sourceLanguage?.code,
    API密钥: llmApiKey ? `${llmApiKey.substring(0, 4)}...` : '无',
    LLM提供商: currentLLM,
    上次翻译文本: lastTranslatedTextRef.current?.length || 0,
    是否首次翻译: isFirstTranslationRef.current,
    完整翻译文本长度: completeTranslationRef.current?.length || 0
  });

  // 执行翻译并处理结果
  const executeTranslation = useCallback(async (
    currentSourceTextRef: React.MutableRefObject<string>,
    previousTranslationResultRef: React.MutableRefObject<string>,
    setTranslatedText: (text: string) => void,
    setTranslationError: (error: string) => void,
    addToTranslationHistory: (sourceText: string, translatedText: string, isComplete?: boolean) => void
  ): Promise<void> => {
    try {
      console.log('[executeTranslation] 开始执行翻译', {
        当前源文本: currentSourceTextRef.current?.substring(0, 20) + '...',
        源文本长度: currentSourceTextRef.current?.length || 0,
        源语言: sourceLanguage.code,
        LLM提供商: currentLLM,
        API密钥: llmApiKey ? `${llmApiKey.substring(0, 4)}...` : '无',
        时间戳: new Date().toISOString()
      });
      
      const startCompleteCheck = performance.now();
      
      // 检查源文本是否完整，自动带上 provider 和 API Key
      const isInputCompleteFlag = await isInputComplete(
        sourceText,
        sourceLanguage.code,
        llmApiKey,
        currentLLM
      );
      
      const endCompleteCheck = performance.now();
      console.log('[executeTranslation] 文本完整性检查结果:', {
        isInputComplete: isInputCompleteFlag,
        耗时: `${(endCompleteCheck - startCompleteCheck).toFixed(2)}ms`
      });
      
      // 确定要翻译的文本
      let textToTranslate = sourceText;
      let isIncremental = false;
      
      console.log("[executeTranslation] 准备进行翻译:", { 
        文本长度: textToTranslate.length,
        语言: sourceLanguage.code,
        是否完整输入: isInputCompleteFlag
      });
      
      // 执行翻译并获取结果
      console.log('[executeTranslation] 调用 processIncrementalTranslation', {
        文本长度: textToTranslate.length,
        是否增量: isIncremental,
        完整翻译长度: completeTranslationRef.current?.length || 0
      });
      
      const translationStart = performance.now();
      const translationResult = await processIncrementalTranslation(
        textToTranslate,
        isIncremental,
        completeTranslationRef.current
      );
      const translationEnd = performance.now();
      
      console.log('[executeTranslation] 翻译返回结果:', {
        结果长度: translationResult?.length || 0,
        是否失败: translationResult.includes('[翻译失败]'),
        耗时: `${(translationEnd - translationStart).toFixed(2)}ms`
      });
      
      // 处理翻译结果
      if (translationResult.includes('[翻译失败]')) {
        console.error('[executeTranslation] 翻译失败');
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
          console.log('[executeTranslation] 更新UI翻译结果:', {
            结果长度: translationResult.length,
            源文本长度: sourceText.length
          });
          setTranslatedText(translationResult);
          
          // 评估翻译结果的质量和完整性
          const translationQuality = evaluateTranslationQuality(sourceText, translationResult, isInputCompleteFlag);
          console.log('[executeTranslation] 翻译质量评估:', translationQuality);
          
          if (translationQuality.isValueable) {
            // 只有当翻译结果有足够价值时才添加到历史记录，并标记是否完整
            console.log('[executeTranslation] 添加到翻译历史记录');
            addToTranslationHistory(sourceText, translationResult, isInputCompleteFlag);
          } else {
            console.log('[executeTranslation] 翻译结果价值不足，不添加到历史');
          }
          
          // 更新最后翻译的文本引用
          lastTranslatedTextRef.current = sourceText;
          isFirstTranslationRef.current = false;
          
          console.log('[executeTranslation] 翻译流程完成，更新所有状态');
        } else {
          console.log('[executeTranslation] 源文本已经改变，放弃翻译结果');
        }
      }
    } catch (error) {
      console.error('[executeTranslation] 翻译执行过程出错:', error);
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或检查API密钥"
      });
      return;
    }
  }, [sourceText, sourceLanguage, processIncrementalTranslation, llmApiKey, lastTranslatedTextRef, isFirstTranslationRef, completeTranslationRef, currentLLM]);

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
