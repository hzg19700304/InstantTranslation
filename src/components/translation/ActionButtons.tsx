
import React from "react";
import { MicIcon, Volume2, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  isListening: boolean;
  isSpeaking: boolean;
  translatedText: string;
  isTranslating: boolean;
  handleVoiceInput: () => void;
  handleTextToSpeech: () => void;
  openSettingsModal: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isListening,
  isSpeaking,
  translatedText,
  isTranslating,
  handleVoiceInput,
  handleTextToSpeech,
  openSettingsModal,
}) => {
  return (
    <div className="flex justify-center gap-3 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleVoiceInput}
        className={`border-translator-primary/20 hover:bg-translator-secondary transition-colors ${
          isListening ? "bg-red-100 border-red-300 text-red-600" : ""
        }`}
      >
        <MicIcon size={16} className={`mr-1.5 ${isListening ? "animate-pulse text-red-600" : ""}`} /> 
        {isListening ? "停止输入" : "语音输入"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleTextToSpeech}
        className={`border-translator-primary/20 hover:bg-translator-secondary transition-colors ${
          isSpeaking ? "bg-blue-100 border-blue-300 text-blue-600" : ""
        }`}
        disabled={!translatedText || isTranslating}
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
        <Cog size={16} className="mr-1.5" /> 配置
      </Button>
    </div>
  );
};

export default ActionButtons;
