
import React, { useState } from "react";
import { LLMProviderSelector } from "@/components/translation-settings/LLMProviderSelector";
import { APIKeyInput } from "@/components/translation-settings/APIKeyInput";
import { LLMProvider } from "@/services/translation/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { testLLMConnection } from "@/services/translation";

interface TranslationTabProps {
  currentLLM: LLMProvider;
  setCurrentLLM: (currentLLM: LLMProvider) => void;
  llmApiKey: string;
  setLlmApiKey: (llmApiKey: string) => void;
}

export const TranslationTab: React.FC<TranslationTabProps> = ({
  currentLLM,
  setCurrentLLM,
  llmApiKey,
  setLlmApiKey,
}) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleTestConnection = async () => {
    if (!llmApiKey) {
      toast.error("请先输入API密钥", { description: "需要API密钥才能测试连接" });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('testing');
    try {
      const result = await testLLMConnection(llmApiKey, currentLLM);
      
      if (result) {
        toast.success("连接成功", { description: "API密钥有效" });
        setConnectionStatus('success');
      } else {
        toast.error("连接失败", { description: "API密钥无效或服务不可用" });
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error("测试连接错误:", error);
      toast.error("连接测试出错", { description: "请检查网络连接和API密钥" });
      setConnectionStatus('failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4">
      <LLMProviderSelector 
        currentLLM={currentLLM} 
        setCurrentLLM={(provider) => {
          setCurrentLLM(provider);
          setConnectionStatus('idle');
        }} 
      />
      
      <div className="grid gap-4">
        <APIKeyInput
          apiKey={llmApiKey}
          setApiKey={setLlmApiKey}
          currentLLM={currentLLM}
          onTest={handleTestConnection}
        />
        
        <div className="grid grid-cols-4 items-center gap-4">
          <div></div>
          <div className="col-span-3 flex justify-end space-x-2 items-center">
            <div className="mr-2">
              {renderConnectionStatus()}
            </div>
            <Button 
              variant="secondary"
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试连接"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
