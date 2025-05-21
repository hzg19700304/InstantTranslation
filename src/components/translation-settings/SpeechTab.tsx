import React, { useState } from "react";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SpeechTabProps {
  currentSpeechModel: SpeechModel;
  setCurrentSpeechModel: (model: SpeechModel) => void;
  speechApiKey: string;
  setSpeechApiKey: (apiKey: string) => void;
}

export const SpeechTab: React.FC<SpeechTabProps> = ({
  currentSpeechModel,
  setCurrentSpeechModel,
  speechApiKey,
  setSpeechApiKey,
}) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [apiKeyInput, setApiKeyInput] = useState(speechApiKey);

  const testSpeechConnection = async () => {
    // Web Speech API 不需要 API 密钥，只需要检查浏览器是否支持
    if (currentSpeechModel === "webspeech") {
      const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (speechRecognition) {
        toast.success("浏览器支持Web Speech API", { description: "可以使用原生语音识别" });
        return true;
      } else {
        toast.error("浏览器不支持Web Speech API", { description: "请尝试使用其他语音识别模型" });
        return false;
      }
    }
    
    // 对于其他模型类型，需要 API 密钥
    if (!apiKeyInput) {
      toast.error("请先输入OpenAI API密钥", { description: "需要API密钥才能测试连接" });
      return false;
    }
    
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    try {
      // 简单测试OpenAI API连接
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKeyInput}`
        }
      });
      
      if (response.ok) {
        toast.success("OpenAI API连接成功", { description: "API密钥有效" });
        setConnectionStatus('success');
        return true;
      } else {
        toast.error("OpenAI API连接失败", { description: "API密钥无效或服务不可用" });
        setConnectionStatus('failed');
        return false;
      }
    } catch (error) {
      console.error("测试语音模型连接错误:", error);
      toast.error("连接测试出错", { description: "请检查网络连接和API密钥" });
      setConnectionStatus('failed');
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput && showApiKeyInput) {
      toast.error("请输入API密钥", { description: "需要API密钥才能保存" });
      return;
    }
    
    // 保存API密钥
    setSpeechApiKey(apiKeyInput);
    localStorage.setItem('speech-api-key', apiKeyInput);
    toast.success("API密钥已保存", { description: "您的API密钥已保存在本地" });

    // 自动测试连接
    if (showApiKeyInput) {
      await testSpeechConnection();
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

  // 根据当前模型确定是否需要显示API密钥输入
  const showApiKeyInput = currentSpeechModel !== "webspeech";

  return (
    <div className="grid gap-4">
      <RadioGroup
        value={currentSpeechModel}
        onValueChange={(value) => setCurrentSpeechModel(value as SpeechModel)}
        className="grid grid-cols-1 gap-4"
      >
        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="webspeech" id="webspeech" />
          <Label htmlFor="webspeech" className="flex-1 cursor-pointer">
            <div className="font-semibold">浏览器原生语音识别</div>
            <div className="text-sm text-gray-500">使用系统内置的Web Speech API，无需API密钥</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="whisper" id="whisper" />
          <Label htmlFor="whisper" className="flex-1 cursor-pointer">
            <div className="font-semibold flex items-center">
              <img src="/lovable-uploads/afd98f14-81f1-4bcf-b391-714f747c27f0.png" alt="Whisper" className="w-6 h-6 mr-2 rounded" />
              Whisper
            </div>
            <div className="text-sm text-gray-500">OpenAI通用语音识别模型，适用于多种语言</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="gpt4o" id="gpt4o" />
          <Label htmlFor="gpt4o" className="flex-1 cursor-pointer">
            <div className="font-semibold flex items-center">
              GPT-4o Transcribe
            </div>
            <div className="text-sm text-gray-500">OpenAI高精度语音转文字模型</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="gpt4omini" id="gpt4omini" />
          <Label htmlFor="gpt4omini" className="flex-1 cursor-pointer">
            <div className="font-semibold flex items-center">
              GPT-4o mini Transcribe
            </div>
            <div className="text-sm text-gray-500">OpenAI轻量级语音转文字模型，速度更快</div>
          </Label>
        </div>
      </RadioGroup>
      
      {showApiKeyInput && (
        <div>
          <Label htmlFor="speechApiKey" className="text-sm mb-1 block">
            OpenAI API密钥
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="speechApiKey"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="请输入OpenAI API密钥"
              type="password"
              className="flex-1"
            />
            <Button 
              onClick={handleSaveApiKey} 
              disabled={isTestingConnection}
              size="default"
            >
              保存密钥
              {renderConnectionStatus()}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            需要OpenAI API密钥才能使用这些模型
          </div>
        </div>
      )}
    </div>
  );
};
