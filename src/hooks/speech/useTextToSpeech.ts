
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { speakText } from "@/services/speech";

interface UseTextToSpeechProps {
  translatedText: string;
  targetLanguageCode: string;
  speechSupported: boolean;
}

export const useTextToSpeech = ({
  translatedText,
  targetLanguageCode,
  speechSupported
}: UseTextToSpeechProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle text-to-speech functionality
  const handleTextToSpeech = useCallback(() => {
    if (!speechSupported) {
      toast.error("语音合成不可用", {
        description: "您的设备不支持文本朗读功能"
      });
      return;
    }
    
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
    
    // Start speech synthesis
    speakText(translatedText, targetLanguageCode);
    
    // Monitor speech synthesis state
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
  }, [translatedText, targetLanguageCode, isSpeaking, speechSupported]);

  // Clean up resources
  const cleanupSpeech = () => {
    window.speechSynthesis?.cancel();
  };

  return {
    isSpeaking,
    handleTextToSpeech,
    cleanupSpeech
  };
};
