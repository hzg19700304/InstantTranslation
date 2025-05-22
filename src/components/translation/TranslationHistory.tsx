
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
  // 优化历史记录过滤，更智能地合并相似记录和去除错误记录
  const filteredHistory = history
    .filter(item => {
      // 基本过滤条件
      const isLongEnough = item.sourceText.trim().length >= 3;
      const hasTranslation = item.translatedText.trim().length > 0;
      const isComplete = !item.translatedText.includes("翻译中...") && 
                        !item.translatedText.includes("Error:") &&
                        !item.translatedText.includes("[翻译失败]");
      
      // 检查是否含有明显的错误标记
      const hasObviousErrors = item.translatedText.includes("bao'c") || 
                              item.translatedText.includes("undefined") ||
                              item.translatedText.includes("[object Object]");
      
      // 确保翻译结果和原文不完全相同
      const isDifferent = item.sourceText.toLowerCase() !== item.translatedText.toLowerCase();
      
      return isLongEnough && hasTranslation && isComplete && isDifferent && !hasObviousErrors;
    })
    // 根据上下文智能地合并相似记录，更倾向于保留完整的翻译
    .reduce((uniqueItems, currentItem) => {
      // 检查是否有内容高度相似的项目
      const similarItemIndex = uniqueItems.findIndex(item => {
        // 检查源文本相似性 (使用更严格的相似度检测)
        const isSourceSimilar = calculateSimilarity(item.sourceText, currentItem.sourceText) > 0.8;
        
        // 如果源文本相似，我们认为这些记录应该合并
        return isSourceSimilar;
      });
      
      if (similarItemIndex !== -1) {
        // 如果找到相似项，根据质量和完整性判断保留哪一个
        const existingItem = uniqueItems[similarItemIndex];
        
        // 判断哪个翻译结果更完整/质量更高
        const keepCurrent = isHigherQualityTranslation(currentItem, existingItem);
        
        if (keepCurrent) {
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
  
  // 计算两个文本的相似度 (0-1 范围，1表示完全相同)
  function calculateSimilarity(text1: string, text2: string): number {
    // 如果有一个是空文本，则认为不相似
    if (!text1.trim() || !text2.trim()) return 0;
    
    // 将两个文本转换为小写并去除特殊字符
    const cleanText1 = text1.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5]/g, '').trim();
    const cleanText2 = text2.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5]/g, '').trim();
    
    // 对于非常短的文本，需要更严格
    if (cleanText1.length < 10 || cleanText2.length < 10) {
      return cleanText1 === cleanText2 ? 1 : 0;
    }
    
    // 计算编辑距离的简化版本：检查包含率
    if (cleanText1.includes(cleanText2) || cleanText2.includes(cleanText1)) {
      return 0.9;
    }
    
    // 简单的词重叠检测
    const words1 = new Set(cleanText1.split(/\s+/));
    const words2 = new Set(cleanText2.split(/\s+/));
    
    // 计算交集大小
    const intersection = [...words1].filter(word => words2.has(word)).length;
    
    // 计算并集大小
    const union = words1.size + words2.size - intersection;
    
    // Jaccard 相似度
    return union > 0 ? intersection / union : 0;
  }
  
  // 判断哪个翻译结果质量更高
  function isHigherQualityTranslation(current: TranslationHistoryItem, existing: TranslationHistoryItem): boolean {
    // 比较完整性标记
    if (current.isComplete && !existing.isComplete) return true;
    if (!current.isComplete && existing.isComplete) return false;
    
    // 检查是否有明显的错误标记
    const currentHasErrors = current.translatedText.includes("bao'c") || 
                            current.translatedText.includes("undefined") ||
                            current.translatedText.includes("[object Object]");
    
    const existingHasErrors = existing.translatedText.includes("bao'c") || 
                             existing.translatedText.includes("undefined") || 
                             existing.translatedText.includes("[object Object]");
    
    if (!currentHasErrors && existingHasErrors) return true;
    if (currentHasErrors && !existingHasErrors) return false;
    
    // 比较译文长度 (通常更长的译文包含更多信息)
    if (Math.abs(current.translatedText.length - existing.translatedText.length) > 10) {
      return current.translatedText.length > existing.translatedText.length;
    }
    
    // 优先保留较新的翻译
    return new Date(current.timestamp) > new Date(existing.timestamp);
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
