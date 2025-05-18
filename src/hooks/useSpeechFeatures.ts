
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
  // 所有状态声明必须在其他钩子之前
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // 引用必须在所有状态声明之后
  const stopListeningRef = useRef<(() => void) | null>(null);
  const currentVoiceSessionTextRef = useRef<string>("");
  const lastInterimResultRef = useRef<string>("");
  const baseTextRef = useRef<string>("");

  // 语音输入处理
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
      lastInterimResultRef.current = "";
      return;
    }
    
    toast.info("开始持续语音输入", {
      description: `请开始说话，使用${sourceLanguageName}...您可以连续讲话，完成后请点击停止按钮`
    });
    
    setIsListening(true);
    
    // 保存当前输入框的文本作为基础文本
    baseTextRef.current = sourceText;
    currentVoiceSessionTextRef.current = sourceText;
    
    // 开始语音识别，处理临时和最终结果
    const stopListening = startVoiceInput(
      sourceLanguageCode,
      (text, isFinal) => {
        if (isFinal) {
          // 处理最终结果 - 将新识别的文本追加到已有文本
          const newText = currentVoiceSessionTextRef.current 
            ? `${currentVoiceSessionTextRef.current} ${text}`.trim() 
            : text;
          
          setSourceText(newText);
          currentVoiceSessionTextRef.current = newText;
          lastInterimResultRef.current = "";
        } else {
          // 处理临时结果，显示在输入框中但不影响已有文本
          // 移除上一个临时结果，添加新的临时结果
          let displayText = currentVoiceSessionTextRef.current || "";
          if (lastInterimResultRef.current) {
            // 如果存在上一个临时结果，先移除它
            displayText = displayText.replace(new RegExp(`${lastInterimResultRef.current.trim()}$`), "").trim();
          }
          
          // 添加新的临时结果
          displayText = `${displayText} ${text}`.trim();
          setSourceText(displayText);
          lastInterimResultRef.current = text;
        }
      },
      () => {
        // 持续模式下不会自动停止
        // 只有当用户点击停止时才会触发
      }
    );
    
    stopListeningRef.current = stopListening;
  }, [sourceLanguageCode, sourceLanguageName, isListening, setSourceText, sourceText]);

  // 文本朗读功能
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
    // 组件卸载时清理资源
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // 源文本更改时，更新当前会话文本
  useEffect(() => {
    if (!isListening) {
      currentVoiceSessionTextRef.current = sourceText;
    }
  }, [sourceText, isListening]);

  return {
    isListening,
    isSpeaking,
    handleVoiceInput,
    handleTextToSpeech
  };
};
