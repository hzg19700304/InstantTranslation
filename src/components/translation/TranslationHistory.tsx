
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
  // 优化历史记录过滤，根据上下文和内容相关性来整合
  const filteredHistory = history
    .filter(item => {
      // 基本过滤条件
      const isLongEnough = item.sourceText.trim().length >= 3;
      const hasTranslation = item.translatedText.trim().length > 0;
      const isComplete = !item.translatedText.includes("翻译中...") && 
                        !item.translatedText.includes("Error:") &&
                        !item.translatedText.includes("[翻译失败]");
      
      // 确保翻译结果和原文不完全相同
      const isDifferent = item.sourceText.toLowerCase() !== item.translatedText.toLowerCase();
      
      return isLongEnough && hasTranslation && isComplete && isDifferent;
    })
    // 根据上下文整合相似的翻译，保留最新的一条
    .reduce((uniqueItems, currentItem) => {
      // 检查是否有内容高度相似的项目
      const similarItemIndex = uniqueItems.findIndex(item => 
        // 检查源文本或译文是否包含对方的大部分内容
        isTextSimilar(item.sourceText, currentItem.sourceText) ||
        isTextSimilar(item.translatedText, currentItem.translatedText)
      );
      
      if (similarItemIndex !== -1) {
        // 如果找到相似项，保留时间较新的一个
        if (new Date(currentItem.timestamp) > new Date(uniqueItems[similarItemIndex].timestamp)) {
          uniqueItems[similarItemIndex] = currentItem;
        }
      } else {
        // 没有找到相似项，添加新项
        uniqueItems.push(currentItem);
      }
      
      return uniqueItems;
    }, [] as TranslationHistoryItem[]);
  
  // 最多显示5条历史记录
  const displayHistory = filteredHistory.slice(0, 5);
  
  // 检查文本相似度的辅助函数
  function isTextSimilar(text1: string, text2: string): boolean {
    // 如果两个字符串都很短，使用更严格的相似度检查
    if (text1.length < 10 && text2.length < 10) {
      return text1.toLowerCase() === text2.toLowerCase();
    }
    
    // 对于长文本，计算包含率
    const text1Lower = text1.toLowerCase();
    const text2Lower = text2.toLowerCase();
    
    // 检查较短的文本是否是较长文本的一部分
    if (text1Lower.length < text2Lower.length) {
      return text2Lower.includes(text1Lower);
    } else {
      return text1Lower.includes(text2Lower);
    }
  }

  if (displayHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-translator-primary/10">
      <ScrollArea className="h-[250px] max-h-[250px]">
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
