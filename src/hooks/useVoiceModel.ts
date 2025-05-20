
import { useState, useCallback, useEffect } from "react";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import { useLocalStorage } from "./useLocalStorage";

export const useVoiceModel = () => {
  const [currentSpeechModel, setCurrentSpeechModel] = useLocalStorage<SpeechModel>(
    "speech-model", 
    "webspeech"
  );
  
  const [speechApiKey, setSpeechApiKey] = useLocalStorage<string>(
    "speech-api-key",
    ""
  );

  // Test connection with the current model and API key
  const testVoiceModelConnection = useCallback(async () => {
    if (currentSpeechModel === "webspeech") {
      const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      return speechRecognition != null;
    }
    
    if (!speechApiKey) return false;
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${speechApiKey}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error("Test voice model connection error:", error);
      return false;
    }
  }, [currentSpeechModel, speechApiKey]);

  return {
    currentSpeechModel,
    setCurrentSpeechModel,
    speechApiKey,
    setSpeechApiKey,
    testVoiceModelConnection
  };
};
