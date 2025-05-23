
import { useCallback } from "react";
import { toast } from "sonner";
import { shouldTranslateEx } from "@/services/translation/completeness";
import { useLLMSettings } from './useLLMSettings';

interface UseTranslationValidationProps {
  lastTranslatedTextRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
}

/**
 * 处理翻译验证逻辑
 */
export const useTranslationValidation = ({
  lastTranslatedTextRef,
  isFirstTranslationRef
}: UseTranslationValidationProps) => {
  const { llmApiKey, currentLLM } = useLLMSettings();
  
  // 验证源文本是否应该被翻译
  const shouldExecuteTranslation = useCallback(async (
    sourceText: string,
    sourceLanguageCode: string
  ): Promise<boolean> => {
    console.log('[shouldExecuteTranslation] 检查是否应该执行翻译', {
      源文本长度: sourceText?.length || 0,
      源语言: sourceLanguageCode,
      上次翻译文本长度: lastTranslatedTextRef.current?.length || 0,
      是否首次翻译: isFirstTranslationRef.current,
      LLM提供商: currentLLM,
      是否有API密钥: !!llmApiKey,
      时间戳: new Date().toISOString()
    });
    
    if (!sourceText) {
      console.log('[shouldExecuteTranslation] 源文本为空，不执行翻译');
      return false;
    }
    
    // 使用新的停顿/完整性检测
    const start = Date.now();
    
    console.log('[shouldExecuteTranslation] 调用shouldTranslateEx检测完整性');
    const should = await shouldTranslateEx(
      sourceText,
      sourceLanguageCode,
      lastTranslatedTextRef.current,
      isFirstTranslationRef.current,
      llmApiKey,
      currentLLM
    );
    const end = Date.now();
    
    console.log("[shouldExecuteTranslation] 翻译判断结果:", {
      ...should,
      完整性检查耗时: (end - start) / 1000 + "秒"
    });

    (window as any).__lastCheck = should; // 暂存供后续钩子使用

    if (!should.shouldTranslate) {
      console.log('[shouldExecuteTranslation] 不执行翻译，原因:', should.reason);
      return false; // 不触发翻译
    }
    
    if (!llmApiKey && currentLLM !== "huggingface") {
      console.log('[shouldExecuteTranslation] 缺少API密钥，提示用户');
      toast.error("翻译需要API密钥", {
        description: "请在设置中配置大模型API密钥"
      });
      return false;
    }
    
    console.log('[shouldExecuteTranslation] 验证通过，执行翻译');
    return true;
  }, [llmApiKey, lastTranslatedTextRef, isFirstTranslationRef, currentLLM]);
  
  return { shouldExecuteTranslation };
};
