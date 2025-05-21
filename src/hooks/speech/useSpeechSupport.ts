
import { useState, useEffect } from "react";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

interface UseSpeechSupportProps {
  currentSpeechModel: SpeechModel;
  speechApiKey: string;
}

export const useSpeechSupport = ({
  currentSpeechModel,
  speechApiKey
}: UseSpeechSupportProps) => {
  const [speechSupported, setSpeechSupported] = useState(true);

  // Check speech API availability
  useEffect(() => {
    const hasRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSynthesis = !!(window.speechSynthesis);
    
    // If using a model for speech recognition, check if MediaDevices API is available
    const isUsingModel = currentSpeechModel !== "webspeech";
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (isUsingModel) {
      // When using an external model, check for API key and media device access
      const hasApiKey = !!speechApiKey;
      setSpeechSupported(hasMediaDevices && hasApiKey && hasSynthesis);
    } else {
      // When using Web Speech API, check for recognition and synthesis API availability
      setSpeechSupported(hasRecognition && hasSynthesis);
    }
  }, [currentSpeechModel, speechApiKey]);

  return {
    speechSupported
  };
};
