
import { useState, useEffect, useCallback, useRef } from "react";
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
  // All state declarations must come before any other hooks
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs must come after all state declarations
  const stopListeningRef = useRef<(() => void) | null>(null);
  const currentVoiceSessionTextRef = useRef<string>("");
  const lastInterimResultRef = useRef<string>("");

  // Callbacks must come after refs
  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      // 停止当前的语音识别
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      
      setIsListening(false);
      toast.info("语音输入已停止", {
        description: "持续聆听模式已关闭"
      });

      // 重置语音会话文本引用，为下一次语音输入做准备
      currentVoiceSessionTextRef.current = "";
      lastInterimResultRef.current = "";
      return;
    }
    
    toast.info("开始持续语音输入", {
      description: `请开始说话，使用${sourceLanguageName}...您可以连续讲话，完成后请点击停止按钮`
    });
    
    setIsListening(true);
    
    // 开始新的语音会话，使用当前输入框中的文本作为基础
    currentVoiceSessionTextRef.current = sourceText;
    
    // 开始语音识别，处理临时和最终结果
    const stopListening = startVoiceInput(
      sourceLanguageCode,
      (text, isFinal) => {
        if (isFinal) {
          // 处理最终结果，这里的text已经包含了整个会话的文本
          setSourceText(text);
          // 更新当前会话文本
          currentVoiceSessionTextRef.current = text;
          // 清除临时结果引用
          lastInterimResultRef.current = "";
        } else {
          // 处理临时结果，这里也直接使用text，因为语音服务已经合并了之前的结果
          lastInterimResultRef.current = text;
          setSourceText(text);
        }
      },
      () => {
        // 持续模式下不会自动停止
        // 只有当用户点击停止时才会触发
      }
    );
    
    stopListeningRef.current = stopListening;
  }, [sourceLanguageCode, sourceLanguageName, isListening, setSourceText, sourceText]);

  // Text-to-speech function
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

  // Effects must come after all callbacks
  useEffect(() => {
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
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
