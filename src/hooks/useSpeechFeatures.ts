
import { useEffect } from "react";
import { useVoiceInput } from "./speech/useVoiceInput";
import { useTextToSpeech } from "./speech/useTextToSpeech";
import { useSpeechSupport } from "./speech/useSpeechSupport";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

interface UseSpeechFeaturesProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  sourceLanguageCode: string;
  sourceLanguageName: string;
  targetLanguageCode: string;
  currentSpeechModel?: SpeechModel;
  speechApiKey?: string;
}

export const useSpeechFeatures = ({ 
  sourceText,
  setSourceText,
  translatedText,
  sourceLanguageCode,
  sourceLanguageName,
  targetLanguageCode,
  currentSpeechModel = "webspeech",
  speechApiKey = ""
}: UseSpeechFeaturesProps) => {
  // Check speech API support
  const { speechSupported } = useSpeechSupport({
    currentSpeechModel,
    speechApiKey
  });
  
  // Handle voice input
  const { 
    isListening, 
    handleVoiceInput,
    cleanupVoiceInput,
    currentVoiceSessionTextRef
  } = useVoiceInput({
    sourceText,
    setSourceText,
    sourceLanguageCode,
    sourceLanguageName,
    currentSpeechModel,
    speechApiKey
  });
  
  // Handle text-to-speech
  const {
    isSpeaking,
    handleTextToSpeech,
    cleanupSpeech
  } = useTextToSpeech({
    translatedText,
    targetLanguageCode,
    speechSupported
  });

  // Clean up resources on component unmount
  useEffect(() => {
    return () => {
      cleanupVoiceInput();
      cleanupSpeech();
    };
  }, []);

  // Update current session text when source text changes
  useEffect(() => {
    if (!isListening) {
      currentVoiceSessionTextRef.current = sourceText;
    }
  }, [sourceText, isListening]);

  return {
    isListening,
    isSpeaking,
    speechSupported,
    handleVoiceInput,
    handleTextToSpeech
  };
};
