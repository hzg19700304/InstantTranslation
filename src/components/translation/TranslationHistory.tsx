
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
  // 使用更智能的过滤逻辑，保留更少，更有价值的历史记录
  const filteredHistory = history.filter(item => {
    // 过滤条件 - 更严格筛选
    const isLongEnough = item.sourceText.trim().length >= 4; // 增加最小长度要求
    const hasTranslation = item.translatedText.trim().length >= 3; 
    const isComplete = !item.translatedText.includes("翻译中...") && 
                       !item.translatedText.includes("Error:") &&
                       !item.translatedText.includes("[翻译失败]");
    
    // 确保翻译结果和原文不完全相同并且足够有意义
    const isMeaningfulTranslation = 
      item.sourceText.toLowerCase() !== item.translatedText.toLowerCase() &&
      item.translatedText.length >= item.sourceText.length * 0.2; // 提高有意义翻译的标准
    
    return isLongEnough && hasTranslation && isComplete && isMeaningfulTranslation;
  });

  if (filteredHistory.length === 0) {
    return null;
  }

  // 最多只显示5条历史记录
  const displayHistory = filteredHistory.slice(0, 5);

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-translator-primary/10">
      <ScrollArea className="max-h-[250px]">
        <div className="p-3 space-y-3">
          {displayHistory.map((item, index) => (
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
              
              {/* 翻译文本 - 根据完整性使用不同颜色 */}
              <div className={cn(
                "font-medium", 
                item.isComplete ? "text-blue-700" : "text-gray-500"
              )}>
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
