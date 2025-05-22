
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranslationHistoryItem } from "@/hooks/translation/useTranslationState";
import { cn } from "@/lib/utils";

interface TranslationHistoryProps {
  history: TranslationHistoryItem[];
  sourceLanguage: string;
  targetLanguage: string;
}

const TranslationHistory: React.FC<TranslationHistoryProps> = ({
  history,
  sourceLanguage,
  targetLanguage
}) => {
  // 过滤掉空的或过短的历史记录
  const filteredHistory = history.filter(item => 
    item.sourceText.trim().length > 3 && 
    item.translatedText.trim().length > 0 && 
    !item.translatedText.includes("翻译中...")
  );

  if (filteredHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-translator-primary/10">
      <ScrollArea className="h-[300px]">
        <div className="p-3 space-y-3">
          {filteredHistory.map((item, index) => (
            <div key={index} className="text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs bg-translator-secondary/50 px-2 py-0.5 rounded-full">
                  {sourceLanguage} → {targetLanguage}
                </div>
              </div>
              
              {/* 源文本 */}
              <div className="mb-1 text-gray-700 font-normal">{item.sourceText}</div>
              
              {/* 翻译文本 - 只显示完整翻译 */}
              <div className="text-gray-800 font-medium">
                {item.translatedText}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranslationHistory;
