
import React from "react";
import TranslationSettingsModal from "@/components/TranslationSettingsModal";
import { LLMProvider } from "@/services/translation/types";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

interface TranslationLayoutProps {
  children: React.ReactNode;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  onCloseSettingsModal: () => void;
  currentLLM: LLMProvider;
  setCurrentLLM: (currentLLM: LLMProvider) => void;
  llmApiKey: string;
  setLlmApiKey: (llmApiKey: string) => void;
  currentSpeechModel?: SpeechModel;
  setCurrentSpeechModel?: (model: SpeechModel) => void;
  speechApiKey?: string;
  setSpeechApiKey?: (apiKey: string) => void;
  isNative?: boolean;
  isAndroid?: boolean;
}

const TranslationLayout: React.FC<TranslationLayoutProps> = ({
  children,
  isSettingsModalOpen,
  openSettingsModal,
  onCloseSettingsModal,
  currentLLM,
  setCurrentLLM,
  llmApiKey,
  setLlmApiKey,
  currentSpeechModel,
  setCurrentSpeechModel,
  speechApiKey,
  setSpeechApiKey,
  isNative = false,
  isAndroid = false,
}) => {
  // 调整不同平台的样式
  const containerClasses = isNative 
    ? "min-h-screen bg-gradient-to-b from-white to-translator-secondary/30 px-2 py-6" 
    : "min-h-screen bg-gradient-to-b from-white to-translator-secondary/30 px-4 py-8";

  const maxWidthClasses = isNative && isAndroid ? "w-full" : "max-w-md"; 

  return (
    <div className={containerClasses}>
      <div className={`${maxWidthClasses} mx-auto`}>
        {/* 标题 */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-translator-primary">即时翻译</h1>
          <p className="text-sm text-muted-foreground mt-1">
            快速翻译任何语言的文本
          </p>
        </div>

        {children}
        
        {/* 版权信息 */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            © 2025 即时翻译 App | 版本 1.0.0
          </p>
        </div>
      </div>
      
      {/* 翻译设置模态框 */}
      <TranslationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
        useLLM={true}
        setUseLLM={() => {}}
        currentLLM={currentLLM}
        setCurrentLLM={setCurrentLLM}
        llmApiKey={llmApiKey}
        setLlmApiKey={setLlmApiKey}
        currentSpeechModel={currentSpeechModel}
        setCurrentSpeechModel={setCurrentSpeechModel}
        speechApiKey={speechApiKey}
        setSpeechApiKey={setSpeechApiKey}
      />
    </div>
  );
};

export default TranslationLayout;
