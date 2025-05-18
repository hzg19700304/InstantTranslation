
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  // 追踪语音识别会话中的文本，这不会被清空，除非手动取消语音识别
  const currentVoiceSessionTextRef = useRef<string>("");
  // 追踪最近一次临时识别结果，用于避免重复追加相同的文本
  const lastInterimResultRef = useRef<string>("");

  // 实现语音输入功能
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
    
    // 开始新的语音会话，保留当前文本作为基础
    currentVoiceSessionTextRef.current = sourceText;
    
    // 开始语音识别，添加isFinal标志来区分临时和最终结果
    const stopListening = startVoiceInput(
      sourceLanguageCode,
      (text, isFinal) => {
        if (isFinal) {
          // 处理最终结果
          // 将新的最终文本追加到当前会话文本中
          if (text !== lastInterimResultRef.current) {
            const newSessionText = currentVoiceSessionTextRef.current 
              ? `${currentVoiceSessionTextRef.current} ${text}`
              : text;
              
            // 更新当前会话文本
            currentVoiceSessionTextRef.current = newSessionText;
            
            // 更新输入框文本
            setSourceText(newSessionText);
            
            // 清除临时结果引用
            lastInterimResultRef.current = "";
          }
        } else {
          // 处理临时结果，临时显示但不更新会话文本
          lastInterimResultRef.current = text;
          
          // 计算完整的预览文本
          const previewText = currentVoiceSessionTextRef.current 
            ? `${currentVoiceSessionTextRef.current} ${text}`
            : text;
            
          // 仅更新UI显示，但不更新会话文本
          setSourceText(previewText);
        }
      },
      () => {
        // 持续模式下不会自动停止
        // 只有当用户点击停止时才会触发
      }
    );
    
    stopListeningRef.current = stopListening;
    
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
        // 清除语音会话引用
        currentVoiceSessionTextRef.current = "";
        lastInterimResultRef.current = "";
      }
    };
  }, [sourceLanguageCode, sourceLanguageName, isListening, setSourceText, sourceText]);

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
