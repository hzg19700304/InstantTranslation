import React from "react";
import { Repeat, Trash2, History, RefreshCw, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslationCard from "@/components/TranslationCard";
import { Language } from "@/types/translation";
import { useVoiceInput } from "@/hooks/speech/useVoiceInput";
import { TranslationHistoryItem } from "@/hooks/translation/useTranslationState";
import TranslationHistory from "./TranslationHistory";

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
  handleClearHistory?: () => void;
  currentSpeechModel: import("@/components/speech/VoiceModelSelector").SpeechModel;
  speechApiKey: string;
  isTranslationComplete?: boolean;
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
  handleClearHistory = () => {},
  currentSpeechModel,
  speechApiKey,
  isTranslationComplete = true
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

  // 历史记录默认始终显示
  const [showHistory, setShowHistory] = React.useState(true);

  // 日志：输出翻译结果
  console.log('translatedText in UI:', translatedText);

  return (
    <div className="space-y-4">
      {/* 历史记录显示区域 - 始终在顶部显示 */}
      {showHistory && translationHistory.length > 0 && (
        <TranslationHistory 
          history={translationHistory}
          sourceLanguage={sourceLanguage.name}
          targetLanguage={targetLanguage.name}
        />
      )}
      
      {/* 源语言输入卡片 */}
      <TranslationCard
        language={sourceLanguage}
        value={sourceText}
        onChange={setSourceText}
        isSource={true}
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
      
      {/* 功能按钮区域 */}
      <div className="flex justify-between mt-2">
        {/* 隐藏/显示历史按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="border-translator-primary/20 hover:bg-translator-secondary"
        >
          <History size={14} className="mr-1.5"/> 
          {showHistory ? "隐藏历史" : "显示历史"}
        </Button>

        {/* 清空按钮 */}
        <div className="flex gap-2">
          {showHistory && translationHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="border-translator-primary/20 hover:bg-translator-secondary"
            >
              <RefreshCw size={14} className="mr-1.5"/> 清空历史
            </Button>
          )}
          
          {sourceText && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearTranslation}
              className="border-translator-primary/20 hover:bg-translator-secondary"
            >
              <Trash2 size={14} className="mr-1.5"/> 清空输入
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-full p-1.5 shadow-sm">
          <ArrowDown size={16} className="text-translator-primary/60" />
        </div>
      </div>
    </div>
  );
};

export default TranslationContent;
