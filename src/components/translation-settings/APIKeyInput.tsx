
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { testLLMConnection, getLLMDisplayName } from "@/services/translation/llmTranslation";
import { LLMProvider } from "@/services/translation/types";

interface APIKeyInputProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  currentLLM: LLMProvider;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({
  apiKey,
  setApiKey,
  currentLLM,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  
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
  
  // 测试连接按钮点击处理
  const handleTestConnection = async () => {
    if (!apiKeyInput) {
      toast.error("请输入API密钥", {
        description: "要测试连接，需要提供有效的API密钥"
      });
      return;
    }
    
    setIsTesting(true);
    
    try {
      const isConnected = await testLLMConnection(apiKeyInput, currentLLM);
      
      if (isConnected) {
        toast.success("连接成功", {
          description: `成功连接到${getLLMDisplayName(currentLLM)}API`
        });
      } else {
        toast.error("连接失败", {
          description: `无法连接到${getLLMDisplayName(currentLLM)}API，请检查API密钥是否有效`
        });
      }
    } catch (error) {
      toast.error("连接测试出错", {
        description: `${(error as Error).message}`
      });
    } finally {
      setIsTesting(false);
    }
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                测试连接中...
              </>
            ) : (
              "测试连接"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
