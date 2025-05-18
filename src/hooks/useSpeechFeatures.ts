
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
  // 追踪上一次识别的文本，用于增量添加新内容
  const lastRecognizedTextRef = useRef<string>("");

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
      return;
    }
    
    toast.info("开始持续语音输入", {
      description: `请开始说话，使用${sourceLanguageName}...您可以连续讲话，完成后请点击停止按钮`
    });
    
    setIsListening(true);
    
    // 保存当前文本，以便于增量添加
    lastRecognizedTextRef.current = sourceText;
    
    // 开始语音识别
    const stopListening = startVoiceInput(
      sourceLanguageCode,
      (text) => {
        // 在这里我们只更新文本，如果新的文本和上一次的不同
        if (text !== lastRecognizedTextRef.current) {
          // 如果原来有内容，添加一个空格然后再添加新内容
          if (lastRecognizedTextRef.current) {
            // 检查新文本是否包含旧文本作为前缀，如果不包含则使用拼接方式
            if (!text.startsWith(lastRecognizedTextRef.current)) {
              setSourceText(lastRecognizedTextRef.current + " " + text);
            } else {
              // 如果新文本包含旧文本，则直接使用新文本
              setSourceText(text);
            }
          } else {
            setSourceText(text);
          }
          lastRecognizedTextRef.current = text;
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
