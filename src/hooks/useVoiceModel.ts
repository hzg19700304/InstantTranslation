
import { useState, useCallback } from "react";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import { useLocalStorage } from "./useLocalStorage";

export const useVoiceModel = () => {
  const [isVoiceModelSelectorOpen, setIsVoiceModelSelectorOpen] = useState(false);
  const [currentSpeechModel, setCurrentSpeechModel] = useLocalStorage<SpeechModel>(
    "speech-model", 
    "webspeech"
  );
  const [speechApiKey, setSpeechApiKey] = useLocalStorage<string>(
    "speech-api-key",
    ""
  );

  const openVoiceModelSelector = useCallback(() => {
    setIsVoiceModelSelectorOpen(true);
  }, []);

  const closeVoiceModelSelector = useCallback(() => {
    setIsVoiceModelSelectorOpen(false);
  }, []);

  return {
    isVoiceModelSelectorOpen,
    openVoiceModelSelector,
    closeVoiceModelSelector,
    currentSpeechModel,
    setCurrentSpeechModel,
    speechApiKey,
    setSpeechApiKey
  };
};
