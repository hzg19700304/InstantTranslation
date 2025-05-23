
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LLMProvider } from "@/services/translation/types";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import { TranslationTab } from "@/components/translation-settings/TranslationTab";
import { SpeechTab } from "@/components/translation-settings/SpeechTab";

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
            <TranslationTab
              currentLLM={currentLLM}
              setCurrentLLM={setCurrentLLM}
              llmApiKey={llmApiKey}
              setLlmApiKey={setLlmApiKey}
            />
          </TabsContent>
          
          <TabsContent value="speech" className="pt-4">
            <SpeechTab
              currentSpeechModel={currentSpeechModel}
              setCurrentSpeechModel={setCurrentSpeechModel}
              speechApiKey={speechApiKey}
              setSpeechApiKey={setSpeechApiKey}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationSettingsModal;
