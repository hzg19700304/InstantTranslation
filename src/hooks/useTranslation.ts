
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Language } from "@/types/translation";
import { LLMProvider } from "@/services/translation/types";
import { translateText, translateWithLLM } from "@/services/translation";

interface UseTranslationProps {
  initialSourceLanguage: Language;
  initialTargetLanguage: Language;
}

export const useTranslation = ({ 
  initialSourceLanguage,
  initialTargetLanguage
}: UseTranslationProps) => {
  // 所有状态声明必须在前面
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>(initialSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<Language>(initialTargetLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [useLLM, setUseLLM] = useState(false);
  const [llmApiKey, setLlmApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentLLM, setCurrentLLM] = useState<LLMProvider>("huggingface");
  const [retryCount, setRetryCount] = useState(0);
  const [translationError, setTranslationError] = useState("");
  
  // 然后是所有引用
  const lastTranslatedTextRef = useRef<string>("");
  const currentSourceTextRef = useRef<string>("");
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationInProgressRef = useRef<boolean>(false);
  const previousTranslationResultRef = useRef<string>("");
  const completeTranslationRef = useRef<string>("");

  // 语言切换功能
  const handleSwapLanguages = useCallback(() => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // 同时交换文本
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }, [sourceLanguage, targetLanguage, sourceText, translatedText]);

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
    if (sourceText === lastTranslatedTextRef.current) {
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
      if (lastTranslatedTextRef.current && sourceText.startsWith(lastTranslatedTextRef.current)) {
        const newText = sourceText.substring(lastTranslatedTextRef.current.length).trim();
        // 只有当新文本有内容时，才进行增量翻译
        if (newText) {
          textToTranslate = newText;
          isIncremental = true;
        }
      }
      
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
            // 对于全新翻译，替换整个翻译结果
            completeTranslationRef.current = result;
            previousTranslationResultRef.current = result;
            setTranslatedText(result);
          }
          
          // 更新最后翻译的文本引用
          lastTranslatedTextRef.current = sourceText;
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
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, isTranslating]);

  // 语言或模型改变时，重置上次翻译的文本记录和完整翻译记录
  useEffect(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
  }, [sourceLanguage, targetLanguage, useLLM, currentLLM]);

  // 监听文本变化，延迟自动翻译，防止频繁更新导致翻译结果闪烁
  useEffect(() => {
    // 取消之前的计时器
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    // 设置新的计时器，延长延迟时间，减少因输入停顿导致的多次翻译
    translationTimeoutRef.current = setTimeout(() => {
      performTranslation();
    }, 1500); // 增加延迟时间，减少因短暂停顿导致的重新翻译
    
    // 组件卸载时清理计时器
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, performTranslation, retryCount]);

  // 手动重试翻译功能
  const handleRetryTranslation = useCallback(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    setRetryCount(prev => prev + 1);
    toast.info("正在重试翻译", {
      description: "尝试连接到备用翻译服务器..."
    });
  }, []);

  // 保存API密钥
  const saveApiKey = useCallback(() => {
    if (llmApiKey) {
      localStorage.setItem('llm_api_key', llmApiKey);
      setShowApiKeyInput(false);
      toast.success("API密钥已保存", {
        description: "您的API密钥已保存在本地"
      });
      performTranslation();
    } else {
      toast.error("请输入API密钥", {
        description: "要使用大模型翻译，需要提供有效的API密钥"
      });
    }
  }, [llmApiKey, performTranslation]);
  
  // 加载保存的API密钥
  useEffect(() => {
    const savedKey = localStorage.getItem('llm_api_key');
    if (savedKey) {
      setLlmApiKey(savedKey);
    }
  }, []);

  return {
    sourceText,
    setSourceText,
    translatedText,
    setTranslatedText,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isTranslating,
    useLLM,
    setUseLLM,
    llmApiKey,
    setLlmApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    currentLLM,
    setCurrentLLM,
    translationError,
    handleSwapLanguages,
    handleRetryTranslation,
    saveApiKey
  };
};
