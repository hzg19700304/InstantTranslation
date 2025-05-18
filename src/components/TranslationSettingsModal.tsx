
import React from "react";
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

interface TranslationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useLLM: boolean;
  setUseLLM: (useLLM: boolean) => void;
  currentLLM: LLMProvider;
  setCurrentLLM: (currentLLM: LLMProvider) => void;
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
          <LLMToggle useLLM={useLLM} setUseLLM={setUseLLM} />
          
          {useLLM && (
            <>
              <LLMProviderSelector 
                currentLLM={currentLLM} 
                setCurrentLLM={setCurrentLLM} 
              />
              
              <APIKeyInput
                apiKey={llmApiKey}
                setApiKey={setLlmApiKey}
                currentLLM={currentLLM}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationSettingsModal;
