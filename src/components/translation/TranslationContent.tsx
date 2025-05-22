import React from "react";
import { ArrowDown, Repeat, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslationCard from "@/components/TranslationCard";
import { Language } from "@/types/translation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVoiceInput } from "@/hooks/speech/useVoiceInput";

interface TranslationHistoryItem {
  sourceText: string;
  translatedText: string;
  timestamp: Date;
}

interface TranslationContentProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  translationError: string;
  setSourceText: (text: string) => void;
  handleRetryTranslation: () => void;
  translationHistory?: TranslationHistoryItem[];
  handleClearTranslation?: () => void;
  currentSpeechModel: import("@/components/speech/VoiceModelSelector").SpeechModel;
  speechApiKey: string;
}

const TranslationContent: React.FC<TranslationContentProps> = ({
  sourceLanguage,
  targetLanguage,
  sourceText,
  translatedText,
  isTranslating,
  translationError,
  setSourceText,
  handleRetryTranslation,
  translationHistory = [],
  handleClearTranslation = () => {},
  currentSpeechModel,
  speechApiKey
}) => {
  const { resetVoiceInputRefs } = useVoiceInput({
    sourceText,
    setSourceText,
    sourceLanguageCode: sourceLanguage.code,
    sourceLanguageName: sourceLanguage.name,
    currentSpeechModel,
    speechApiKey
  });

  const onClearTranslation = () => {
    setSourceText('');
    resetVoiceInputRefs('');
    handleClearTranslation();
  };

  return (
    <div className="space-y-4">
      <TranslationCard
        language={sourceLanguage}
        value={sourceText}
        onChange={setSourceText}
        isSource={true}
      />
      
      <div className="flex justify-center">
        <div className="bg-white rounded-full p-1.5 shadow-sm">
          <ArrowDown size={16} className="text-translator-primary/60" />
        </div>
      </div>
      
      <TranslationCard
        language={targetLanguage}
        value={translatedText}
        className={isTranslating ? "opacity-70" : ""}
      />
      
      {/* 翻译错误提示和重试按钮 */}
      {translationError && (
        <div className="mt-2 text-center">
          <p className="text-sm text-red-500 mb-2">{translationError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetryTranslation}
            className="border-translator-primary/20 hover:bg-translator-secondary"
          >
            <Repeat size={14} className="mr-1.5"/> 重试翻译
          </Button>
        </div>
      )}
      
      {/* 清空翻译按钮 */}
      {(sourceText || translatedText) && (
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearTranslation}
            className="border-translator-primary/20 hover:bg-translator-secondary"
          >
            <Trash2 size={14} className="mr-1.5"/> 清空翻译
          </Button>
        </div>
      )}
    </div>
  );
};

export default TranslationContent;
