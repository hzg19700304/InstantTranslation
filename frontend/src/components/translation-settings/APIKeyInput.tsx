
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LLMProvider } from "@/services/translation/types";

interface APIKeyInputProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  currentLLM: LLMProvider;
  onTest?: () => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({
  apiKey,
  setApiKey,
  currentLLM,
  onTest
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  
  // 同步外部和内部状态
  useEffect(() => {
    setApiKeyInput(apiKey);
  }, [apiKey]);
  
  // 保存API密钥到本地存储
  const saveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error("API密钥不能为空", {
        description: "请输入有效的API密钥"
      });
      return;
    }
    
    const apiKeyToSave = apiKeyInput.trim();
    localStorage.setItem('llm_api_key', apiKeyToSave);
    setApiKey(apiKeyToSave);
    toast.success("API密钥已保存", {
      description: "您的API密钥已保存在本地"
    });
    
    // 如果提供了测试函数，自动测试连接
    if (onTest) {
      setTimeout(onTest, 500);
    }
  };

  let placeholderText = "输入API密钥";
  if (currentLLM === "chatgpt") {
    placeholderText = "输入OpenAI API密钥(sk-...)";
  } else if (currentLLM === "deepseek") {
    placeholderText = "输入DeepSeek API密钥";
  } else if (currentLLM === "gemini") {
    placeholderText = "输入Google AI API密钥";
  }
  
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="api-key" className="text-right">
          API 密钥
        </Label>
        <Input
          id="api-key"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className="col-span-3"
          type="password"
          placeholder={placeholderText}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div></div>
        <div className="col-span-3 flex justify-end space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={saveApiKey}
          >
            保存密钥
          </Button>
        </div>
      </div>
    </>
  );
};

// 获取LLM显示名称的辅助函数
function getLLMDisplayName(provider: LLMProvider): string {
  switch (provider) {
    case 'huggingface':
      return 'HuggingFace';
    case 'deepseek':
      return 'DeepSeek Chat';
    case 'gemini':
      return 'Google Gemini';
    case 'chatgpt':
      return 'ChatGPT';
    default:
      return provider || '未知模型';
  }
}
