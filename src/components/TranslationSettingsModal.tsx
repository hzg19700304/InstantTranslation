
import React, { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

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

  // 处理API提供商更改
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setUseLLM(value === "llm");
  };

  // 处理LLM模型更改
  const handleModelChange = (value: string) => {
    setCurrentLLM(value);
  };

  // 保存配置
  const handleSaveSettings = () => {
    if (selectedProvider === "llm" && tempApiKey) {
      localStorage.setItem('llm_api_key', tempApiKey);
      setLlmApiKey(tempApiKey);
    }
    onClose();
  };

  // 测试连接
  const handleTestConnection = () => {
    // 这里可以实现测试连接的逻辑
    alert("测试连接功能将在未来版本中提供");
  };

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
            variant="outline"
            className="flex-1 border-blue-300 text-blue-500 hover:bg-blue-50"
          >
            测试连接
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationSettingsModal;
