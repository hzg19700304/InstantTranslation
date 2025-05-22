import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Speech } from "lucide-react";

// 更新SpeechModel类型定义，确保包含 "webspeech"
export type SpeechModel = "webspeech" | "gpt4o" | "gpt4omini" | "whisper" | "silero-vad";

interface VoiceModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: SpeechModel;
  setCurrentModel: (model: SpeechModel) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

export const VoiceModelSelector: React.FC<VoiceModelSelectorProps> = ({
  isOpen,
  onClose,
  currentModel,
  setCurrentModel,
  apiKey,
  setApiKey,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择语音识别模型</DialogTitle>
          <DialogDescription>
            请选择用于语音识别的模型。不同模型有不同的识别能力和资源需求。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={currentModel}
            onValueChange={(value) => setCurrentModel(value as SpeechModel)}
            className="grid grid-cols-1 gap-4"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="webspeech" id="webspeech" />
              <Label htmlFor="webspeech" className="flex-1 cursor-pointer">
                <div className="font-semibold">浏览器原生语音识别</div>
                <div className="text-sm text-gray-500">使用系统内置的Web Speech API，无需API密钥</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="whisper" id="whisper" />
              <Label htmlFor="whisper" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center">
                  <img src="/lovable-uploads/afd98f14-81f1-4bcf-b391-714f747c27f0.png" alt="Whisper" className="w-6 h-6 mr-2 rounded" />
                  Whisper
                </div>
                <div className="text-sm text-gray-500">OpenAI通用语音识别模型，适用于多种语言</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="gpt4o" id="gpt4o" />
              <Label htmlFor="gpt4o" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center">
                  GPT-4o Transcribe
                </div>
                <div className="text-sm text-gray-500">OpenAI高精度语音转文字模型</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="gpt4omini" id="gpt4omini" />
              <Label htmlFor="gpt4omini" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center">
                  GPT-4o mini Transcribe
                </div>
                <div className="text-sm text-gray-500">OpenAI轻量级语音转文字模型，速度更快</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="silero-vad" id="silero-vad" />
              <Label htmlFor="silero-vad" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center">
                  Silero VAD (自动分段)
                </div>
                <div className="text-sm text-green-600">本地人声检测，自动分段，极快响应，无需API密钥</div>
              </Label>
            </div>
          </RadioGroup>
          
          {currentModel !== "webspeech" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API密钥
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入OpenAI API密钥"
                className="col-span-3"
                type="password"
              />
              <div className="col-span-4 text-xs text-gray-500 text-right">
                需要OpenAI API密钥才能使用这些模型
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
