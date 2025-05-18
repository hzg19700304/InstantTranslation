
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { startVoiceInput, speakText } from "@/services/speech";

interface UseSpeechFeaturesProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  sourceLanguageCode: string;
  sourceLanguageName: string;
  targetLanguageCode: string;
}

export const useSpeechFeatures = ({ 
  sourceText,
  setSourceText,
  translatedText,
  sourceLanguageCode,
  sourceLanguageName,
  targetLanguageCode
}: UseSpeechFeaturesProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 实现语音输入功能
  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      toast.info("正在停止语音输入", {
        description: "语音输入已取消"
      });
      return;
    }
    
    toast.info("语音输入", {
      description: `请开始说话，使用${sourceLanguageName}...`
    });
    
    setIsListening(true);
    
    // 开始语音识别
    const stopListening = startVoiceInput(
      sourceLanguageCode,
      (text) => {
        setSourceText(text);
        toast.success("语音识别完成", {
          description: `已识别: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`
        });
      },
      () => {
        setIsListening(false);
      }
    );
    
    // 10秒后自动停止，避免长时间监听
    const timeout = setTimeout(() => {
      stopListening();
      setIsListening(false);
      toast.info("语音输入超时", {
        description: "已自动停止语音输入"
      });
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      stopListening();
    };
  }, [sourceLanguageCode, sourceLanguageName, isListening, setSourceText]);

  // 实现文本朗读功能
  const handleTextToSpeech = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      toast.info("朗读已停止", {
        description: "已取消文本朗读"
      });
      return;
    }
    
    if (!translatedText) {
      toast.error("没有可朗读的文本", {
        description: "请先输入文本并完成翻译"
      });
      return;
    }
    
    toast.info("文本朗读", {
      description: "正在朗读译文..."
    });
    
    setIsSpeaking(true);
    
    // 开始朗读
    speakText(translatedText, targetLanguageCode);
    
    // 监听朗读结束
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis?.speaking) {
        setIsSpeaking(false);
        clearInterval(checkSpeaking);
      }
    }, 500);
    
    return () => {
      clearInterval(checkSpeaking);
      window.speechSynthesis?.cancel();
    };
  }, [translatedText, targetLanguageCode, isSpeaking]);

  // 组件卸载时停止所有语音活动
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    handleVoiceInput,
    handleTextToSpeech
  };
};
