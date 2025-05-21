
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
    localStorage.setItem('llm_api_key', apiKeyInput);
    setApiKey(apiKeyInput);
    toast.success("API密钥已保存", {
      description: "您的API密钥已保存在本地"
    });
  };
  
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
