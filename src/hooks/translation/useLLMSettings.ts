
import { useState, useEffect } from "react";
import { LLMProvider } from "@/services/translation/types";
import { toast } from "sonner";
import { useVoiceModel } from "@/hooks/useVoiceModel";

export const useLLMSettings = () => {
  // 确保所有的状态钩子在最顶层
  const [llmApiKey, setLlmApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentLLM, setCurrentLLM] = useState<LLMProvider>("huggingface");
  
  // 获取语音模型设置
  const {
    currentSpeechModel,
    setCurrentSpeechModel,
    speechApiKey,
    setSpeechApiKey
  } = useVoiceModel();
  
  // 保存API密钥
  const saveApiKey = () => {
    if (llmApiKey) {
      localStorage.setItem('llm_api_key', llmApiKey);
      setShowApiKeyInput(false);
      toast.success("API密钥已保存", {
        description: "您的API密钥已保存在本地"
      });
      return true;
    } else {
      toast.error("请输入API密钥", {
        description: "要使用大模型翻译，需要提供有效的API密钥"
      });
      return false;
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
    llmApiKey,
    setLlmApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    currentLLM,
    setCurrentLLM,
    currentSpeechModel,
    setCurrentSpeechModel,
    speechApiKey,
    setSpeechApiKey,
    saveApiKey
  };
};
