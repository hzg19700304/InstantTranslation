import React, { useState, useEffect, useCallback } from "react";
import { Cog, Repeat, Volume2, MicIcon, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import TranslationCard from "@/components/TranslationCard";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationSettingsModal from "@/components/TranslationSettingsModal";
import { LANGUAGES } from "@/constants/languages";
import { Language } from "@/types/translation";
import { translateText, translateWithLLM, getLLMDisplayName } from "@/services/translation";
import { LLMProvider } from "@/services/translation/types";

const Index = () => {
  
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>(LANGUAGES[1]); // 英语
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES[0]); // 中文
  const [isTranslating, setIsTranslating] = useState(false);
  const [useLLM, setUseLLM] = useState(false);
  const [llmApiKey, setLlmApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentLLM, setCurrentLLM] = useState<LLMProvider>("huggingface"); // 使用LLMProvider类型
  const [retryCount, setRetryCount] = useState(0);
  const [translationError, setTranslationError] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
      setTranslationError("");
      return;
    }
    
    setIsTranslating(true);
    setTranslationError("");
    
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
      
      // 检查返回结果是否包含错误信息
      if (result.includes("[翻译失败:")) {
        setTranslationError("翻译服务暂时不可用，请稍后再试");
        // 显示错误提示
        toast.error("翻译服务暂时不可用", {
          description: "我们正在尝试连接到备用服务器"
        });
      } else {
        setTranslationError("");
      }
      
      setTranslatedText(result);
    } catch (error) {
      setTranslationError("翻译服务连接失败");
      toast.error("翻译失败", {
        description: "无法完成翻译，请稍后再试或切换翻译模式"
      });
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM]);

  // 监听文本变化，自动翻译
  useEffect(() => {
    const translateTimeout = setTimeout(() => {
      performTranslation();
    }, 500);
    return () => clearTimeout(translateTimeout);
  }, [sourceText, sourceLanguage, targetLanguage, useLLM, llmApiKey, currentLLM, performTranslation, retryCount]);

  // 手动重试翻译功能
  const handleRetryTranslation = () => {
    setRetryCount(prev => prev + 1);
    toast.info("正在重试翻译", {
      description: "尝试连接到备用翻译服务器..."
    });
  };

  // 打开设置模态框
  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  // 切换使用大模型翻译
  const toggleLLMTranslation = () => {
    if (!useLLM && !llmApiKey) {
      setShowApiKeyInput(true);
    }
    setUseLLM(!useLLM);
  };
  
  // 选择大模型
  const selectLLM = (model: LLMProvider) => {  // 修改参数类型为LLMProvider
    setCurrentLLM(model);
    
    // 如果用户当前不在使用LLM模式，自动切换到LLM模式
    if (!useLLM) {
      setUseLLM(true);
      
      // 如果没有API密钥，显示输入框
      if (!llmApiKey) {
        setShowApiKeyInput(true);
      }
    }
    
    toast.info("已选择模型", {
      description: `当前使用${getLLMDisplayName(model)}进行翻译`
    });
  };
  
  // 获取LLM显示名称 - 使用导入的函数
  const getLLMDisplayName = (model: string): string => {
    return getLLMDisplayName(model);
  };
  
  // 保存API密钥并关闭输入框
  const saveApiKey = () => {
    if (llmApiKey) {
      localStorage.setItem('llm_api_key', llmApiKey);
      setShowApiKeyInput(false);
      toast.success("API密钥已保存", {
        description: "您的API密钥已保存在本地"
      });
      performTranslation();
    } else {
      toast.error("请输入API密钥", {
        description: "要使用大模型翻译，需要提供有效的API密钥"
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
    toast.info("语音输入", {
      description: "语音输入功能即将推出..."
    });
  };

  // 模拟文本朗读功能
  const handleTextToSpeech = () => {
    toast.info("文本朗读", {
      description: "文本朗读功能即将推出..."
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

        {/* 功能按钮 - 现在三个按钮在同一行 */}
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={openSettingsModal}
            className="border-translator-primary/20 hover:bg-translator-secondary"
          >
            <Cog size={16} className="mr-1.5" /> 配置
          </Button>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 即时翻译 App | 版本 1.0.0
          </p>
        </div>
      </div>
      
      {/* 翻译设置模态框 */}
      <TranslationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        useLLM={useLLM}
        setUseLLM={setUseLLM}
        currentLLM={currentLLM}
        setCurrentLLM={setCurrentLLM}
        llmApiKey={llmApiKey}
        setLlmApiKey={setLlmApiKey}
      />
    </div>
  );
};

export default Index;
