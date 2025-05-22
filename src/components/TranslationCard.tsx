
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { Language } from '@/types/translation';

interface TranslationCardProps {
  language: Language;
  value: string;
  onChange?: (value: string) => void;
  isSource?: boolean;
  isComplete?: boolean; // Prop to indicate if translation is complete
  className?: string;
}

const TranslationCard = ({ 
  language, 
  value, 
  onChange, 
  isSource = false, 
  isComplete = true, // Default to true for backward compatibility
  className 
}: TranslationCardProps) => {
  return (
    <Card className={cn("w-full shadow-sm border-translator-primary/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-translator-primary">{language.name}</span>
          {isSource && (
            <span className="ml-2 text-xs text-muted-foreground">
              (输入文字)
            </span>
          )}
          {!isSource && (
            <span className="ml-2 text-xs text-muted-foreground">
              (翻译结果)
            </span>
          )}
          {/* 显示完整性状态 */}
          {!isSource && (
            <span className={cn(
              "ml-auto text-xs px-1.5 py-0.5 rounded-full", 
              isComplete ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            )}>
              {isComplete ? "完整" : "部分"}
            </span>
          )}
        </div>
        <Textarea
          value={value}
          onChange={isSource ? (e) => onChange?.(e.target.value) : undefined}
          placeholder={isSource ? "请输入要翻译的文字..." : "翻译结果将显示在这里..."}
          className={cn(
            "min-h-[120px] border-translator-primary/10 focus:border-translator-primary",
            isSource && "bg-translator-secondary/50",
            !isSource && !isComplete && "text-gray-500 bg-white", // Incomplete translations in gray
            !isSource && isComplete && "text-blue-700 bg-white" // Complete translations in blue
          )}
          readOnly={!isSource}
        />
      </CardContent>
    </Card>
  );
};

export default TranslationCard;
