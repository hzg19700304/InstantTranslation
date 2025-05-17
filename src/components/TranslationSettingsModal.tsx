import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { testLLMConnection, getLLMDisplayName } from "@/services/translation";

interface TranslationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useLLM: boolean;
  setUseLLM: (useLLM: boolean) => void;
  currentLLM: string;
  setCurrentLLM: (currentLLM: string) => void;
  llmApiKey: string;
  setLlmApiKey: (llmApiKey: string) => void;
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
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(llmApiKey);
  const [isTesting, setIsTesting] = useState(false);
  
  // 保存API密钥到本地存储
  const saveApiKey = () => {
    localStorage.setItem('llm_api_key', apiKeyInput);
    setLlmApiKey(apiKeyInput);
    toast.success("API密钥已保存", {
      description: "您的API密钥已保存在本地"
    });
  };
  
  // 测试连接按钮点击处理
  const handleTestConnection = async () => {
    if (!llmApiKey) {
      toast.error("请输入API密钥", {
        description: "要测试连接，需要提供有效的API密钥"
      });
      return;
    }
    
    setIsTesting(true);
    
    try {
      const isConnected = await testLLMConnection(llmApiKey, currentLLM as any);
      
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

  // 同步apiKeyInput和llmApiKey
  useEffect(() => {
    setApiKeyInput(llmApiKey);
  }, [llmApiKey]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>翻译设置</SheetTitle>
          <SheetDescription>
            配置翻译选项，包括选择翻译引擎和API密钥。
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="llm" className="text-right">
              使用大模型翻译
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="llm"
                checked={useLLM}
                onCheckedChange={setUseLLM}
              />
            </div>
          </div>
          
          {useLLM && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  选择大模型
                </Label>
                <div className="col-span-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {getLLMDisplayName(currentLLM)}
                         <Check className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setCurrentLLM("huggingface")}>
                        HuggingFace
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentLLM("deepseek")}>
                        DeepSeek Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentLLM("gemini")}>
                        Google Gemini
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationSettingsModal;
