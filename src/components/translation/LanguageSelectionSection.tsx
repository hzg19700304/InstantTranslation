
import React from "react";
import { Repeat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { Language } from "@/types/translation";
import { getLLMDisplayName } from "@/services/translation";
import { LLMProvider } from "@/services/translation/types";

interface LanguageSelectionSectionProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  setSourceLanguage: (language: Language) => void;
  setTargetLanguage: (language: Language) => void;
  handleSwapLanguages: () => void;
  languages: Language[];
  useLLM: boolean;
  currentLLM: LLMProvider;
}

const LanguageSelectionSection: React.FC<LanguageSelectionSectionProps> = ({
  sourceLanguage,
  targetLanguage,
  setSourceLanguage,
  setTargetLanguage,
  handleSwapLanguages,
  languages,
  useLLM,
  currentLLM,
}) => {
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-6">
        <LanguageSelector
          languages={languages}
          selectedLanguage={sourceLanguage}
          onSelect={setSourceLanguage}
          label="源语言"
          className="flex-1"
        />
        
        <div className="flex flex-col items-center justify-center h-full pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapLanguages}
            className="rounded-full h-8 w-8 p-0 hover:bg-translator-secondary"
          >
            <Repeat size={18} className="text-translator-primary" />
          </Button>
        </div>
        
        <LanguageSelector
          languages={languages}
          selectedLanguage={targetLanguage}
          onSelect={setTargetLanguage}
          label="目标语言"
          className="flex-1"
        />
      </div>

      {/* 当前使用的大模型提示 */}
      {useLLM && (
        <div className="text-right text-xs text-translator-primary mb-2">
          <span className="inline-flex items-center">
            <Sparkles size={12} className="mr-1" />
            {getLLMDisplayName(currentLLM)}
          </span>
        </div>
      )}
    </>
  );
};

export default LanguageSelectionSection;
