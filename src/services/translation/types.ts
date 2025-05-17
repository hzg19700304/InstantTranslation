
// Shared types for translation services

// API Translation Response
export interface LibreTranslateResponse {
  translatedText: string;
  error?: string;
}

// LLM Provider Types
export type LLMProvider = 'huggingface' | 'deepseek' | 'gemini';
