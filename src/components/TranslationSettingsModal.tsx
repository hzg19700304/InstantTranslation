
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LLMToggle } from "@/components/translation-settings/LLMToggle";
import { LLMProviderSelector } from "@/components/translation-settings/LLMProviderSelector";
import { APIKeyInput } from "@/components/translation-settings/APIKeyInput";
import { LLMProvider } from "@/services/translation/types";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface TranslationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useLLM: boolean;
  setUseLLM: (useLLM: boolean) => void;
  currentLLM: LLMProvider;
  setCurrentLLM: (currentLLM: LLMProvider) => void;
  llmApiKey: string;
  setLlmApiKey: (llmApiKey: string) => void;
  currentSpeechModel?: SpeechModel;
  setCurrentSpeechModel?: (model: SpeechModel) => void;
  speechApiKey?: string;
  setSpeechApiKey?: (apiKey: string) => void;
}

const TranslationSettingsModal: React.FC<TranslationSettingsModalProps> = ({
  isOpen,
  onClose,
  useLLM,
  setUseLLM,
  currentLLM,
  setCurrentLLM,
  llmApiKey,
  setLlmApiKey,
  currentSpeechModel = "webspeech",
  setCurrentSpeechModel = () => {},
  speechApiKey = "",
  setSpeechApiKey = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("translation");
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
      // 导入测试函数
      const { testLLMConnection } = await import('@/services/translation/llmTranslation');
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

  const handleTestSpeechConnection = async () => {
    if (currentSpeechModel === "webspeech") {
      const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (speechRecognition) {
        toast.success("浏览器支持Web Speech API", { description: "可以使用原生语音识别" });
        return;
      } else {
        toast.error("浏览器不支持Web Speech API", { description: "请尝试使用其他语音识别模型" });
        return;
      }
    }
    
    if (!speechApiKey) {
      toast.error("请先输入OpenAI API密钥", { description: "需要API密钥才能测试连接" });
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    try {
      // 简单测试OpenAI API连接
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${speechApiKey}`
        }
      });
      
      if (response.ok) {
        toast.success("OpenAI API连接成功", { description: "API密钥有效" });
        setConnectionStatus('success');
      } else {
        toast.error("OpenAI API连接失败", { description: "API密钥无效或服务不可用" });
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error("测试语音模型连接错误:", error);
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>应用设置</SheetTitle>
          <SheetDescription>
            配置翻译和语音识别选项
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="translation">翻译设置</TabsTrigger>
            <TabsTrigger value="speech">语音识别</TabsTrigger>
          </TabsList>
          
          <TabsContent value="translation" className="pt-4">
            <div className="grid gap-4">
              <LLMProviderSelector 
                currentLLM={currentLLM} 
                setCurrentLLM={setCurrentLLM} 
              />
              
              <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                <APIKeyInput
                  apiKey={llmApiKey}
                  setApiKey={setLlmApiKey}
                  currentLLM={currentLLM}
                />
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTestingConnection || !llmApiKey}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {isTestingConnection ? '测试中...' : '测试连接'}
                  {renderConnectionStatus()}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="speech" className="pt-4">
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
              
              {currentSpeechModel !== "webspeech" && (
                <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                  <div>
                    <Label htmlFor="speechApiKey" className="text-sm mb-1 block">
                      OpenAI API密钥
                    </Label>
                    <Input
                      id="speechApiKey"
                      value={speechApiKey}
                      onChange={(e) => setSpeechApiKey(e.target.value)}
                      placeholder="请输入OpenAI API密钥"
                      type="password"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      需要OpenAI API密钥才能使用这些模型
                    </div>
                  </div>
                  <Button 
                    onClick={handleTestSpeechConnection} 
                    disabled={isTestingConnection || (currentSpeechModel !== "webspeech" && !speechApiKey)}
                    size="sm"
                    className="min-w-[80px]"
                  >
                    {isTestingConnection ? '测试中...' : '测试连接'}
                    {renderConnectionStatus()}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationSettingsModal;
