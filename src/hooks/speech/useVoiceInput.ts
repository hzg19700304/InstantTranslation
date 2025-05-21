
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { startVoiceInput } from "@/services/speech";
import { startModelVoiceInput } from "@/services/speech/modelSpeech";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

interface UseVoiceInputProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  sourceLanguageCode: string;
  sourceLanguageName: string;
  currentSpeechModel: SpeechModel;
  speechApiKey: string;
}

export const useVoiceInput = ({
  sourceText,
  setSourceText,
  sourceLanguageCode,
  sourceLanguageName,
  currentSpeechModel,
  speechApiKey
}: UseVoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  
  // References for tracking speech recognition state
  const stopListeningRef = useRef<(() => void) | null>(null);
  const currentVoiceSessionTextRef = useRef<string>("");
  const lastInterimResultRef = useRef<string>("");
  const baseTextRef = useRef<string>("");

  // Handle voice input start/stop
  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      // Stop current voice recognition session
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      
      setIsListening(false);
      toast.info("语音输入已停止", {
        description: "持续聆听模式已关闭"
      });

      // Reset speech session references for next input
      lastInterimResultRef.current = "";
      return;
    }
    
    // Request microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          startVoiceRecognition();
        })
        .catch((error) => {
          console.error("麦克风访问被拒绝:", error);
          toast.error("无法访问麦克风", {
            description: "请确保您已授予应用麦克风权限"
          });
        });
    } else {
      // Try direct launch, some browsers will auto-request permission
      startVoiceRecognition();
    }
  }, [isListening, sourceLanguageCode, sourceLanguageName, sourceText, setSourceText, currentSpeechModel, speechApiKey]);

  // Start voice recognition
  const startVoiceRecognition = useCallback(() => {
    toast.info("开始持续语音输入", {
      description: `请开始说话，使用${sourceLanguageName}...您可以连续讲话，完成后请点击停止按钮`
    });
    
    setIsListening(true);
    
    // Save current input text as base text
    baseTextRef.current = sourceText;
    currentVoiceSessionTextRef.current = sourceText;
    
    // Handle interim and final results callback
    const handleResult = (text: string, isFinal: boolean) => {
      if (isFinal) {
        // Handle final result - append to existing text
        const newText = currentVoiceSessionTextRef.current 
          ? `${currentVoiceSessionTextRef.current} ${text}`.trim() 
          : text;
        
        setSourceText(newText);
        currentVoiceSessionTextRef.current = newText;
        lastInterimResultRef.current = "";
      } else {
        // Handle interim result, showing in input box without affecting saved text
        let displayText = currentVoiceSessionTextRef.current || "";
        if (lastInterimResultRef.current) {
          // Remove previous interim result
          displayText = displayText.replace(new RegExp(`${lastInterimResultRef.current.trim()}$`), "").trim();
        }
        
        // Add new interim result
        displayText = `${displayText} ${text}`.trim();
        setSourceText(displayText);
        lastInterimResultRef.current = text;
      }
    };
    
    // Select speech recognition method based on chosen model
    if (currentSpeechModel === "webspeech") {
      // Use Web Speech API
      const stopListening = startVoiceInput(
        sourceLanguageCode,
        handleResult,
        () => {
          // Only show notification when isListening is true
          if (isListening) {
            setIsListening(false);
            stopListeningRef.current = null;
            toast.info("语音识别已结束", {
              description: "语音输入已自动停止"
            });
          }
        }
      );
      stopListeningRef.current = stopListening;
    } else {
      // Use model-based speech recognition
      startModelVoiceInput(
        currentSpeechModel,
        speechApiKey,
        sourceLanguageCode,
        handleResult,
        () => {
          // Only show notification when isListening is true
          if (isListening) {
            setIsListening(false);
            stopListeningRef.current = null;
            toast.info("语音识别已结束", {
              description: "语音输入已自动停止"
            });
          }
        }
      ).then(stopFunc => {
        if (stopFunc) {
          stopListeningRef.current = stopFunc;
        }
      }).catch(error => {
        console.error("启动模型语音识别错误:", error);
        setIsListening(false);
        toast.error("无法启动语音识别", {
          description: "请检查API密钥和网络连接"
        });
      });
    }
  }, [sourceLanguageCode, sourceLanguageName, sourceText, setSourceText, currentSpeechModel, speechApiKey, isListening]);

  // Clean up resources on unmount
  const cleanupVoiceInput = () => {
    if (stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
    }
  };

  return {
    isListening,
    handleVoiceInput,
    cleanupVoiceInput,
    currentVoiceSessionTextRef
  };
};
