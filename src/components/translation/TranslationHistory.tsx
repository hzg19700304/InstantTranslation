
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranslationHistoryItem } from "@/hooks/translation/useTranslationState";
import { cn } from "@/lib/utils";
import { isInputComplete } from "@/services/translation/completeness";

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
  // 使用更智能的过滤逻辑，避免过滤掉有意义的翻译记录
  const filteredHistory = history.filter(item => {
    // 基本过滤条件 - 进一步放宽
    const isLongEnough = item.sourceText.trim().length > 3; // 降低最小长度要求
    const hasTranslation = item.translatedText.trim().length > 2; // 降低最小长度要求
    const isComplete = !item.translatedText.includes("翻译中...") && 
                       !item.translatedText.includes("Error:") &&
                       !item.translatedText.includes("[翻译失败]");
    
    // 更宽松的有意义翻译判断条件
    // 只要翻译结果长度达到源文本的15%即可（之前是1/6，约16.7%）
    const isMeaningfulTranslation = item.translatedText.length >= item.sourceText.length * 0.15;
    
    // 确保翻译结果和原文不完全相同
    const isDifferent = item.sourceText.toLowerCase() !== item.translatedText.toLowerCase();
    
    return isLongEnough && hasTranslation && isComplete && isMeaningfulTranslation && isDifferent;
  });

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
