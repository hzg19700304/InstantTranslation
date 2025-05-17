
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TranslationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useLLM: boolean;
  setUseLLM: (value: boolean) => void;
  currentLLM: string;
  setCurrentLLM: (value: string) => void;
  llmApiKey: string;
  setLlmApiKey: (value: string) => void;
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
  const [selectedProvider, setSelectedProvider] = useState(useLLM ? "llm" : "api");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [tempApiKey, setTempApiKey] = useState(llmApiKey);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // 处理API提供商更改
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setUseLLM(value !== "api");
  };

  // 处理LLM模型更改
  const handleModelChange = (value: string) => {
    setCurrentLLM(value);
  };

  // 保存配置
  const handleSaveSettings = () => {
    if (selectedProvider !== "api" && tempApiKey) {
      localStorage.setItem('llm_api_key', tempApiKey);
      setLlmApiKey(tempApiKey);
      toast.success("已保存配置");
    } else if (selectedProvider !== "api" && !tempApiKey) {
      toast.error("未提供API密钥");
      return;
    } else {
      toast.success("已切换到LibreTranslate API");
    }
    onClose();
  };

  // 测试连接
  const handleTestConnection = async () => {
    if (selectedProvider === "api") {
      // 测试公共API连接
      setIsTestingConnection(true);
      try {
        const response = await fetch("https://translate.argosopentech.com/languages", {
          method: "GET",
        });
        
        if (response.ok) {
          toast.success("连接成功！LibreTranslate API可用");
        } else {
          toast.error("连接失败：无法访问LibreTranslate API");
        }
      } catch (error) {
        toast.error("连接错误：网络问题或API不可用");
      } finally {
        setIsTestingConnection(false);
      }
    } else {
      // 测试大模型连接
      if (!tempApiKey) {
        toast.error("请先输入API密钥");
        return;
      }
      
      setIsTestingConnection(true);
      try {
        let success = false;
        let message = "";
        
        switch (currentLLM) {
          case "deepseek":
            success = await testDeepSeekConnection(tempApiKey);
            message = success ? "DeepSeek API连接成功！" : "DeepSeek API连接失败，请检查密钥";
            break;
          case "gemini":
            success = await testGeminiConnection(tempApiKey);
            message = success ? "Google Gemini API连接成功！" : "Google Gemini API连接失败，请检查密钥";
            break;
          case "huggingface":
          default:
            success = await testHuggingFaceConnection(tempApiKey);
            message = success ? "HuggingFace API连接成功！" : "HuggingFace API连接失败，请检查密钥";
            break;
        }
        
        if (success) {
          toast.success(message);
        } else {
          toast.error(message);
        }
      } catch (error) {
        toast.error(`连接测试失败: ${(error as Error).message}`);
      } finally {
        setIsTestingConnection(false);
      }
    }
  };

  // 测试HuggingFace连接
  const testHuggingFaceConnection = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: "Hello",
          parameters: {
            src_lang: "en_XX",
            tgt_lang: "zh_CN"
          }
        })
      });
      
      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error("HuggingFace连接错误:", error);
      return false;
    }
  };

  // 测试DeepSeek连接
  const testDeepSeekConnection = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "你是一个翻译助手。"
            },
            {
              role: "user",
              content: "测试连接"
            }
          ],
          max_tokens: 10
        })
      });
      
      const data = await response.json();
      return !!data.choices;
    } catch (error) {
      console.error("DeepSeek连接错误:", error);
      return false;
    }
  };

  // 测试Gemini连接
  const testGeminiConnection = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "测试连接"
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 10
          }
        })
      });
      
      const data = await response.json();
      return !!data.candidates;
    } catch (error) {
      console.error("Gemini连接错误:", error);
      return false;
    }
  };

  // 同步useLLM状态
  useEffect(() => {
    setSelectedProvider(useLLM ? (currentLLM === "deepseek" ? "llm" : 
                                  currentLLM === "gemini" ? "llm_gemini" : 
                                  currentLLM === "huggingface" ? "llm_huggingface" : "llm") : "api");
  }, [useLLM, currentLLM]);

  // 同步API密钥
  useEffect(() => {
    setTempApiKey(llmApiKey);
  }, [llmApiKey]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-translator-primary">模型配置</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 翻译API提供商选择 */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">翻译API提供商:</label>
            <Select 
              value={selectedProvider} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger className="w-full border-translator-primary/20">
                <SelectValue placeholder="选择提供商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">LibreTranslate (免费)</SelectItem>
                <SelectItem value="llm">DeepSeek API</SelectItem>
                <SelectItem value="llm_gemini">Google Gemini</SelectItem>
                <SelectItem value="llm_huggingface">HuggingFace</SelectItem>
              </SelectContent>
            </Select>

            {selectedProvider === "api" && (
              <div className="mt-2 bg-blue-50 p-3 rounded-md text-sm text-blue-600">
                使用公共LibreTranslate服务，可能有速率限制
              </div>
            )}
          </div>

          {/* 大模型特定配置 */}
          {selectedProvider !== "api" && (
            <div className="space-y-4">
              {/* API密钥输入 */}
              <div>
                <label className="font-medium text-gray-700">API 密钥:</label>
                <Input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="在此输入您的API密钥"
                  className="mt-1 border-translator-primary/20"
                />
              </div>

              {/* 模型选择（仅针对某些提供商） */}
              {selectedProvider === "llm" && (
                <div>
                  <label className="font-medium text-gray-700">选择模型:</label>
                  <Select 
                    value="deepseek-chat" 
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="w-full border-translator-primary/20 mt-1">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek-chat">deepseek-chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 温度滑块 */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-medium text-gray-700">温度:</label>
                  <span className="text-sm text-gray-500">{temperature}</span>
                </div>
                <Slider
                  value={[temperature]}
                  max={1}
                  step={0.1}
                  onValueChange={(values) => setTemperature(values[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>更确定</span>
                  <span>更有创意</span>
                </div>
              </div>

              {/* 最大Token数 */}
              <div>
                <label className="font-medium text-gray-700">最大 Token 数:</label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="mt-1 border-translator-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-between mt-4">
          <Button
            onClick={handleSaveSettings}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            保存配置
          </Button>
          <Button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            variant="outline"
            className="flex-1 border-blue-300 text-blue-500 hover:bg-blue-50"
          >
            {isTestingConnection ? "测试中..." : "测试连接"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationSettingsModal;
