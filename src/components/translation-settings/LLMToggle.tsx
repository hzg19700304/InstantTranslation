
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LLMToggleProps {
  useLLM: boolean;
  setUseLLM: (useLLM: boolean) => void;
}

export const LLMToggle: React.FC<LLMToggleProps> = ({ useLLM, setUseLLM }) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="llm" className="text-right">
        使用大模型翻译
      </Label>
      <div className="col-span-3 flex items-center space-x-2">
        <Switch id="llm" checked={useLLM} onCheckedChange={setUseLLM} />
      </div>
    </div>
  );
};
