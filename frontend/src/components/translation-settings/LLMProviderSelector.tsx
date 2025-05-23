
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LLMProvider } from "@/services/translation/types";
import { getLLMDisplayName } from "@/services/translation";

interface LLMProviderSelectorProps {
  currentLLM: LLMProvider;
  setCurrentLLM: (provider: LLMProvider) => void;
}

export const LLMProviderSelector: React.FC<LLMProviderSelectorProps> = ({
  currentLLM,
  setCurrentLLM,
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="model" className="text-right">
        选择大模型
      </Label>
      <div className="col-span-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {getLLMDisplayName(currentLLM)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setCurrentLLM("chatgpt")} className="cursor-pointer">
              ChatGPT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentLLM("deepseek")} className="cursor-pointer">
              DeepSeek Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentLLM("gemini")} className="cursor-pointer">
              Google Gemini
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentLLM("huggingface")} className="cursor-pointer">
              HuggingFace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
