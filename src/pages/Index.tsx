
import React, { useState, useEffect } from "react";
import { Repeat, Volume2, MicIcon, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import TranslationCard from "@/components/TranslationCard";
import LanguageSelector from "@/components/LanguageSelector";
import { LANGUAGES } from "@/constants/languages";
import { Language } from "@/types/translation";
import { translateText } from "@/services/translationService";

const Index = () => {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>(LANGUAGES[1]); // 英语
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES[0]); // 中文
  const [isTranslating, setIsTranslating] = useState(false);

  // 语言切换功能
  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // 同时交换文本
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // 进行翻译
  useEffect(() => {
    const translateTimeout = setTimeout(async () => {
      if (sourceText) {
        setIsTranslating(true);
        try {
          const result = await translateText(
            sourceText,
            sourceLanguage.code,
            targetLanguage.code
          );
          setTranslatedText(result);
        } catch (error) {
          toast({
            title: "翻译失败",
            description: "无法完成翻译，请稍后再试",
            variant: "destructive",
          });
        } finally {
          setIsTranslating(false);
        }
      } else {
        setTranslatedText("");
      }
    }, 500);

    return () => clearTimeout(translateTimeout);
  }, [sourceText, sourceLanguage, targetLanguage, toast]);

  // 模拟语音输入功能
  const handleVoiceInput = () => {
    toast({
      title: "语音输入",
      description: "语音输入功能即将推出...",
    });
  };

  // 模拟文本朗读功能
  const handleTextToSpeech = () => {
    toast({
      title: "文本朗读",
      description: "文本朗读功能即将推出...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-translator-secondary/30 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-translator-primary">即时翻译</h1>
          <p className="text-sm text-muted-foreground mt-1">
            快速翻译任何语言的文本
          </p>
        </div>

        {/* 语言选择器 */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <LanguageSelector
            languages={LANGUAGES}
            selectedLanguage={sourceLanguage}
            onSelect={setSourceLanguage}
            label="源语言"
            className="flex-1"
          />
          
          <div className="flex flex-col items-center justify-center h-full pt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapLanguages}
              className="rounded-full h-8 w-8 p-0 hover:bg-translator-secondary"
            >
              <Repeat size={18} className="text-translator-primary" />
            </Button>
          </div>
          
          <LanguageSelector
            languages={LANGUAGES}
            selectedLanguage={targetLanguage}
            onSelect={setTargetLanguage}
            label="目标语言"
            className="flex-1"
          />
        </div>

        {/* 翻译卡片区域 */}
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
            value={isTranslating ? "翻译中..." : translatedText}
            className={isTranslating ? "opacity-70" : ""}
          />
        </div>

        {/* 功能按钮 */}
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceInput}
            className="border-translator-primary/20 hover:bg-translator-secondary"
          >
            <MicIcon size={16} className="mr-1.5" /> 语音输入
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleTextToSpeech}
            className="border-translator-primary/20 hover:bg-translator-secondary"
          >
            <Volume2 size={16} className="mr-1.5" /> 朗读文本
          </Button>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-12">
          <p className="text-xs text-muted-foreground">
            © 2025 即时翻译 App | 版本 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
