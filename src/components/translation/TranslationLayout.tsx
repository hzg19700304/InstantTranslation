
import React from "react";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslationSettingsModal from "@/components/TranslationSettingsModal";
import { LLMProvider } from "@/services/translation/types";

interface TranslationLayoutProps {
  children: React.ReactNode;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  onCloseSettingsModal: () => void;
  useLLM: boolean;
  setUseLLM: (useLLM: boolean) => void;
  currentLLM: LLMProvider;
  setCurrentLLM: (currentLLM: LLMProvider) => void;
  llmApiKey: string;
  setLlmApiKey: (llmApiKey: string) => void;
}

const TranslationLayout: React.FC<TranslationLayoutProps> = ({
  children,
  isSettingsModalOpen,
  openSettingsModal,
  onCloseSettingsModal,
  useLLM,
  setUseLLM,
  currentLLM,
  setCurrentLLM,
  llmApiKey,
  setLlmApiKey,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-translator-secondary/30 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-translator-primary">即时翻译</h1>
          <p className="text-sm text-muted-foreground mt-1">
            快速翻译任何语言的文本
          </p>
        </div>

        {children}
        
        {/* 版权信息 */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 即时翻译 App | 版本 1.0.0
          </p>
        </div>
      </div>
      
      {/* 翻译设置模态框 */}
      <TranslationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
        useLLM={useLLM}
        setUseLLM={setUseLLM}
        currentLLM={currentLLM}
        setCurrentLLM={setCurrentLLM}
        llmApiKey={llmApiKey}
        setLlmApiKey={setLlmApiKey}
      />
    </div>
  );
};

export default TranslationLayout;
