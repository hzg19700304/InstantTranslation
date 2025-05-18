
import { useState, useEffect, useCallback } from "react";
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

  // 语言切换功能
  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // 同时交换文本
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // 进行翻译
  const performTranslation = useCallback(async () => {
    if (!sourceText) {
      setTranslatedText("");
      setTranslationError("");
      return;
    }
    
    setIsTranslating(true);
    setTranslationError("");
    
    try {
      let result;
      if (useLLM && llmApiKey) {
        // 使用大模型翻译
        result = await translateWithLLM(
          sourceText,
          sourceLanguage.code,
          targetLanguage.code,
          llmApiKey,
          currentLLM
        );
      } else {
        // 使用普通翻译API
        result = await translateText(
          sourceText,
          sourceLanguage.code,
          targetLanguage.code
        );
      }
      
      // 检查返回结果是否包含错误信息
      if (result.includes("[翻译失败:")) {
        setTranslationError("翻译服务暂时不可用，请稍后再试");
        // 显示错误提示
        toast.error("翻译服务暂时不可用", {
          description: "我们正在尝试连接到备用服务器"
        });
      } else {
        setTranslationError("");
      }
      
      setTranslatedText(result);
    } catch (error) {
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或切换翻译模式"
      });
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM]);

  // 监听文本变化，自动翻译
  useEffect(() => {
    const translateTimeout = setTimeout(() => {
      performTranslation();
    }, 500);
    return () => clearTimeout(translateTimeout);
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, performTranslation, retryCount]);

  // 手动重试翻译功能
  const handleRetryTranslation = () => {
    setRetryCount(prev => prev + 1);
    toast.info("正在重试翻译", {
      description: "尝试连接到备用翻译服务器..."
    });
  };

  // 切换使用大模型翻译
  const toggleLLMTranslation = () => {
    if (!useLLM && !llmApiKey) {
      setShowApiKeyInput(true);
    }
    setUseLLM(!useLLM);
  };
  
  // 选择大模型
  const selectLLM = (model: LLMProvider) => {
    setCurrentLLM(model);
    
    // 如果用户当前不在使用LLM模式，自动切换到LLM模式
    if (!useLLM) {
      setUseLLM(true);
      
      // 如果没有API密钥，显示输入框
      if (!llmApiKey) {
        setShowApiKeyInput(true);
      }
    }
    
    toast.info("已选择模型", {
      description: `当前使用${model}进行翻译`
    });
  };
  
  // 保存API密钥并关闭输入框
  const saveApiKey = () => {
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
  };
  
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
    performTranslation,
    handleRetryTranslation,
    toggleLLMTranslation,
    selectLLM,
    saveApiKey
  };
};
