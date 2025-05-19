
import React from "react";
import { ArrowDown, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslationCard from "@/components/TranslationCard";
import { Language } from "@/types/translation";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}) => {
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
      
      {/* 翻译历史记录 */}
      {translationHistory.length > 0 && (
        <ScrollArea className="h-40 rounded-md border border-translator-primary/10 bg-white p-2">
          <div className="space-y-2">
            {translationHistory.map((item, index) => (
              <div key={index} className="rounded-md bg-translator-secondary/30 p-2 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="mb-1 text-gray-700">{item.sourceText}</div>
                <div className="font-medium text-translator-primary">{item.translatedText}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
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
    </div>
  );
};

export default TranslationContent;
