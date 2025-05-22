/**
 * @AI-Generated
 * LLMSettings 全局 Context
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LLMProvider } from "@/services/translation/types";
import { toast } from "sonner";
import { useVoiceModel } from "@/hooks/useVoiceModel";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

interface LLMSettingsContextProps {
  llmApiKey: string;
  setLlmApiKey: (key: string) => void;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (show: boolean) => void;
  currentLLM: LLMProvider;
  setCurrentLLM: (llm: LLMProvider) => void;
  currentSpeechModel: SpeechModel;
  setCurrentSpeechModel: (model: SpeechModel | ((val: SpeechModel) => SpeechModel)) => void;
  speechApiKey: string;
  setSpeechApiKey: (key: string) => void;
  saveApiKey: () => boolean;
}

const LLMSettingsContext = createContext<LLMSettingsContextProps | undefined>(undefined);

export const LLMSettingsProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <LLMSettingsContext.Provider value={{
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
    }}>
      {children}
    </LLMSettingsContext.Provider>
  );
};

export const useLLMSettings = () => {
  const ctx = useContext(LLMSettingsContext);
  if (!ctx) throw new Error("useLLMSettings 必须在 LLMSettingsProvider 内部使用");
  return ctx;
};
