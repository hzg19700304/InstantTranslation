import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { startVoiceInput } from "@/services/speech";
import { startModelVoiceInput } from "@/services/speech/modelSpeech";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import * as vad from '@ricky0123/vad-web';
import { float32ToWavBlob } from '@/lib/utils';
import { InferenceSession, env } from 'onnxruntime-web';

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
  const accumulatedTextRef = useRef<string>(sourceText);

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
    
    // 每次开始都同步 ref 为最新的 sourceText
    baseTextRef.current = sourceText;
    currentVoiceSessionTextRef.current = sourceText;
    accumulatedTextRef.current = sourceText;
    
    // Silero VAD 自动分段模式
    if (currentSpeechModel === 'silero-vad') {
      let micVad: vad.MicVAD | null = null;
      let stopped = false;
      (async () => {
        micVad = await vad.MicVAD.new({
          positiveSpeechThreshold: 0.5,
          negativeSpeechThreshold: 0.3,
          redemptionFrames: 5,
          preSpeechPadFrames: 3,
          onSpeechEnd: async (audio: Float32Array) => {
            if (stopped) return;
            // 1. 转为 WAV Blob
            const wavBlob = float32ToWavBlob(audio, 16000);
            // 2. 上传到大模型 API
            const formData = new FormData();
            formData.append('file', wavBlob, 'speech.wav');
            formData.append('model', 'whisper-1');
            if (sourceLanguageCode) formData.append('language', sourceLanguageCode);
            formData.append('prompt',
              'You are a speech-to-text engine. Transcribe the following audio content as accurately as possible. Only output the exact words spoken in the audio, do not add, complete, or expand the content. If the audio is empty or meaningless, return an empty string. Do not output any explanation, formatting, or additional information. Transcribe in the original language of the audio.'
            );
            try {
              const response = await fetch('/api/translation/speech-to-text', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${speechApiKey}` },
                body: formData
              });
              const result = await response.json();
              if (result.text) {
                // 只和当前输入框内容拼接，不用 ref
                const currentText = (typeof setSourceText === 'function' ? '' : sourceText) || sourceText;
                const newText = currentText.trim() ? currentText + ' ' + result.text : result.text;
                setSourceText(newText);
                // ref 也同步
                accumulatedTextRef.current = newText;
                baseTextRef.current = newText;
                currentVoiceSessionTextRef.current = newText;
              }
            } catch (e) {
              console.error('大模型语音识别失败:', e);
            }
          },
          onSpeechStart: () => {
            // 可选：UI提示"检测到说话"
          },
          onVADMisfire: () => {
            // 可选：处理误触发
          }
        });
        micVad.start();
        stopListeningRef.current = () => {
          stopped = true;
          micVad?.pause();
        };
      })();
      return;
    }
    
    // Handle interim and final results callback
    const handleResult = (text: string, isFinal: boolean) => {
      if (isFinal) {
        // 只和当前输入框内容拼接，不用 ref
        const currentText = sourceText;
        const newText = currentText.trim() ? currentText + ' ' + text : text;
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

  // 新增：重置所有语音输入相关 ref
  const resetVoiceInputRefs = useCallback((text: string = '') => {
    accumulatedTextRef.current = text;
    baseTextRef.current = text;
    currentVoiceSessionTextRef.current = text;
    lastInterimResultRef.current = '';
  }, []);

  return {
    isListening,
    handleVoiceInput,
    cleanupVoiceInput,
    currentVoiceSessionTextRef,
    resetVoiceInputRefs
  };
};

env.wasm.wasmPaths = {
  'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
} as any;
