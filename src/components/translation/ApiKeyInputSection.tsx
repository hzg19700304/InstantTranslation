
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLLMDisplayName } from "@/services/translation";
import { LLMProvider } from "@/services/translation/types";

interface ApiKeyInputSectionProps {
  llmApiKey: string;
  setLlmApiKey: (apiKey: string) => void;
  currentLLM: LLMProvider;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (show: boolean) => void;
  saveApiKey: () => void;
}

const ApiKeyInputSection: React.FC<ApiKeyInputSectionProps> = ({
  llmApiKey,
  setLlmApiKey,
  currentLLM,
  showApiKeyInput,
  setShowApiKeyInput,
  saveApiKey,
}) => {
  if (!showApiKeyInput) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-translator-primary/20 shadow-sm">
      <div className="text-sm font-medium mb-2">API密钥 - {getLLMDisplayName(currentLLM)}</div>
      <Input
        type="password"
        value={llmApiKey}
        onChange={(e) => setLlmApiKey(e.target.value)}
        placeholder={`输入您的${getLLMDisplayName(currentLLM)}API密钥`}
        className="mb-2"
      />
      <div className="text-xs text-muted-foreground mb-2">
        需要API密钥才能使用{getLLMDisplayName(currentLLM)}翻译功能
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowApiKeyInput(false)}
        >
          取消
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={saveApiKey}
          className="bg-translator-primary hover:bg-translator-primary/80"
        >
          保存
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInputSection;
