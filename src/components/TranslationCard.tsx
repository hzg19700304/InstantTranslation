
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
  isComplete?: boolean; // New prop to indicate if translation is complete
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
        </div>
        <Textarea
          value={value}
          onChange={isSource ? (e) => onChange?.(e.target.value) : undefined}
          placeholder={isSource ? "请输入要翻译的文字..." : "翻译结果将显示在这里..."}
          className={cn(
            "min-h-[120px] border-translator-primary/10 bg-translator-secondary/50 focus:border-translator-primary",
            !isSource && !isComplete && "text-gray-500", // Incomplete translations in gray
            !isSource && isComplete && "text-blue-700", // Complete translations in blue
            !isSource && "bg-white"
          )}
          readOnly={!isSource}
        />
      </CardContent>
    </Card>
  );
};

export default TranslationCard;
