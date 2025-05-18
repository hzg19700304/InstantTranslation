
import React from "react";
import { Mic, MicOff, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  isListening: boolean;
  isSpeaking: boolean;
  translatedText: string;
  isTranslating: boolean;
  handleVoiceInput: () => void;
  handleTextToSpeech: () => void;
  openSettingsModal: () => void;
  speechSupported?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isListening,
  isSpeaking,
  translatedText,
  isTranslating,
  handleVoiceInput,
  handleTextToSpeech,
  openSettingsModal,
  speechSupported = true
}) => {
  return (
    <div className="flex justify-center gap-3 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleVoiceInput}
        disabled={!speechSupported}
        className={`border-translator-primary/20 hover:bg-translator-secondary transition-colors ${
          isListening ? "bg-red-100 border-red-300 text-red-600" : ""
        } ${!speechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isListening ? (
          <MicOff size={16} className="mr-1.5 animate-pulse text-red-600" />
        ) : (
          <Mic size={16} className="mr-1.5" />
        )}
        {isListening ? "停止输入" : "持续语音输入"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleTextToSpeech}
        className={`border-translator-primary/20 hover:bg-translator-secondary transition-colors ${
          isSpeaking ? "bg-blue-100 border-blue-300 text-blue-600" : ""
        } ${!speechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!translatedText || isTranslating || !speechSupported}
      >
        <Volume2 size={16} className={`mr-1.5 ${isSpeaking ? "animate-pulse text-blue-600" : ""}`} /> 
        {isSpeaking ? "停止朗读" : "朗读文本"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={openSettingsModal}
        className="border-translator-primary/20 hover:bg-translator-secondary"
      >
        <Settings size={16} className="mr-1.5" /> 配置
      </Button>
    </div>
  );
};

export default ActionButtons;
