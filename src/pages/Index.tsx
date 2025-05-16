
import React, { useState, useEffect, useCallback } from "react";
import { Cog, Repeat, Volume2, MicIcon, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import TranslationCard from "@/components/TranslationCard";
import LanguageSelector from "@/components/LanguageSelector";
import { LANGUAGES } from "@/constants/languages";
import { Language } from "@/types/translation";
import { translateText, translateWithLLM } from "@/services/translationService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>(LANGUAGES[1]); // 英语
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES[0]); // 中文
  const [isTranslating, setIsTranslating] = useState(false);
  const [useLLM, setUseLLM] = useState(false);
  const [llmApiKey, setLlmApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentLLM, setCurrentLLM] = useState<string>("huggingface"); // 默认使用HuggingFace

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
  const performTranslation = useCallback(async () => {
    if (!sourceText) {
      setTranslatedText("");
      return;
    }
    
    setIsTranslating(true);
    try {
      let result;
      if (useLLM && llmApiKey) {
        // 使用大模型翻译
        result = await translateWithLLM(
          sourceText,
          sourceLanguage.code,
          targetLanguage.code,
          llmApiKey,
          currentLLM
        );
      } else {
        // 使用普通翻译API
        result = await translateText(
          sourceText,
          sourceLanguage.code,
          targetLanguage.code
        );
      }
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
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, toast, currentLLM]);

  // 监听文本变化，自动翻译
  useEffect(() => {
    const translateTimeout = setTimeout(performTranslation, 500);
    return () => clearTimeout(translateTimeout);
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, performTranslation]);

  // 切换使用大模型翻译
  const toggleLLMTranslation = () => {
    if (!useLLM && !llmApiKey) {
      setShowApiKeyInput(true);
    }
    setUseLLM(!useLLM);
  };
  
  // 选择大模型
  const selectLLM = (model: string) => {
    setCurrentLLM(model);
    
    // 如果用户当前不在使用LLM模式，自动切换到LLM模式
    if (!useLLM) {
      setUseLLM(true);
      
      // 如果没有API密钥，显示输入框
      if (!llmApiKey) {
        setShowApiKeyInput(true);
      }
    }
    
    toast({
      title: "已选择模型",
      description: `当前使用${getLLMDisplayName(model)}进行翻译`,
    });
  };
  
  // 获取LLM显示名称
  const getLLMDisplayName = (model: string): string => {
    switch (model) {
      case "huggingface":
        return "HuggingFace";
      case "deepseek":
        return "DeepSeek Chat";
      case "gemini":
        return "Google Gemini";
      default:
        return "未知模型";
    }
  };
  
  // 保存API密钥并关闭输入框
  const saveApiKey = () => {
    if (llmApiKey) {
      localStorage.setItem('llm_api_key', llmApiKey);
      setShowApiKeyInput(false);
      toast({
        title: "API密钥已保存",
        description: "您的API密钥已保存在本地",
      });
      performTranslation();
    } else {
      toast({
        title: "请输入API密钥",
        description: "要使用大模型翻译，需要提供有效的API密钥",
        variant: "destructive",
      });
    }
  };
  
  // 加载保存的API密钥
  useEffect(() => {
    const savedKey = localStorage.getItem('llm_api_key');
    if (savedKey) {
      setLlmApiKey(savedKey);
    }
  }, []);

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

        {/* API密钥输入框 */}
        {showApiKeyInput && (
          <div className="mb-4 p-4 bg-white rounded-lg border border-translator-primary/20 shadow-sm">
            <div className="text-sm font-medium mb-2">API密钥 - {getLLMDisplayName(currentLLM)}</div>
            <Input
              type="password"
              value={llmApiKey}
              onChange={(e) => setLlmApiKey(e.target.value)}
              placeholder={`输入您的${getLLMDisplayName(currentLLM)}API密钥`}
              className="mb-2"
            />
            <div className="text-xs text-muted-foreground mb-2">
              需要API密钥才能使用{getLLMDisplayName(currentLLM)}翻译功能
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowApiKeyInput(false)}
              >
                取消
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={saveApiKey}
                className="bg-translator-primary hover:bg-translator-primary/80"
              >
                保存
              </Button>
            </div>
          </div>
        )}

        {/* 语言选择器和大模型设置按钮 */}
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

        {/* 设置按钮和LLM模型选择 */}
        <div className="flex justify-end mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`rounded-full p-2 ${useLLM ? "bg-translator-primary text-white hover:bg-translator-primary/90" : "hover:bg-translator-secondary"}`}
              >
                <Cog size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleLLMTranslation}>
                <Sparkles size={16} className="mr-2" /> 
                大模型翻译 {useLLM ? "开" : "关"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => selectLLM("huggingface")}
                className={currentLLM === "huggingface" ? "bg-translator-secondary/40" : ""}
              >
                HuggingFace
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => selectLLM("deepseek")}
                className={currentLLM === "deepseek" ? "bg-translator-secondary/40" : ""}
              >
                DeepSeek Chat
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => selectLLM("gemini")}
                className={currentLLM === "gemini" ? "bg-translator-secondary/40" : ""}
              >
                Google Gemini
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 当前使用的大模型提示 */}
        {useLLM && (
          <div className="text-right text-xs text-translator-primary mb-2">
            <span className="inline-flex items-center">
              <Sparkles size={12} className="mr-1" />
              {getLLMDisplayName(currentLLM)}
            </span>
          </div>
        )}

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
