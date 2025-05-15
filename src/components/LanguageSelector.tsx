
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Language } from '@/types/translation';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
  label: string;
  className?: string;
}

const LanguageSelector = ({
  languages,
  selectedLanguage,
  onSelect,
  label,
  className
}: LanguageSelectorProps) => {
  return (
    <div className={className}>
      <span className="block text-sm font-medium mb-1.5 text-muted-foreground">
        {label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-translator-primary/20 hover:bg-translator-secondary"
          >
            <div className="flex items-center">
              <Languages size={16} className="mr-2 text-translator-primary" />
              <span>{selectedLanguage.name}</span>
            </div>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
          <DropdownMenuRadioGroup value={selectedLanguage.code}>
            {languages.map((language) => (
              <DropdownMenuRadioItem
                key={language.code}
                value={language.code}
                onClick={() => onSelect(language)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{language.name}</span>
                  {language.code === selectedLanguage.code && (
                    <Check size={16} className="text-translator-primary" />
                  )}
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
