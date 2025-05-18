
import React from "react";
import { LANGUAGES } from "@/constants/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechFeatures } from "@/hooks/useSpeechFeatures";
import { useTranslationSettings } from "@/hooks/useTranslationSettings";

import TranslationLayout from "@/components/translation/TranslationLayout";
import ApiKeyInputSection from "@/components/translation/ApiKeyInputSection";
import LanguageSelectionSection from "@/components/translation/LanguageSelectionSection";
import TranslationContent from "@/components/translation/TranslationContent";
import ActionButtons from "@/components/translation/ActionButtons";

const Index = () => {
  // Initialize translation functionality
  const {
    sourceText,
    setSourceText,
    translatedText,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isTranslating,
    useLLM,
    setUseLLM,
    llmApiKey,
    setLlmApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    currentLLM,
    setCurrentLLM,
    translationError,
    handleSwapLanguages,
    handleRetryTranslation,
    saveApiKey
  } = useTranslation({ 
    initialSourceLanguage: LANGUAGES[1], // 英语
    initialTargetLanguage: LANGUAGES[0], // 中文
  });

  // Initialize speech features
  const {
    isListening,
    isSpeaking,
    handleVoiceInput,
    handleTextToSpeech
  } = useSpeechFeatures({
    sourceText,
    setSourceText,
    translatedText,
    sourceLanguageCode: sourceLanguage.code,
    sourceLanguageName: sourceLanguage.name,
    targetLanguageCode: targetLanguage.code
  });

  // Initialize settings modal
  const {
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal
  } = useTranslationSettings();

  return (
    <TranslationLayout
      isSettingsModalOpen={isSettingsModalOpen}
      openSettingsModal={openSettingsModal}
      onCloseSettingsModal={closeSettingsModal}
      useLLM={useLLM}
      setUseLLM={setUseLLM}
      currentLLM={currentLLM}
      setCurrentLLM={setCurrentLLM}
      llmApiKey={llmApiKey}
      setLlmApiKey={setLlmApiKey}
    >
      {/* API密钥输入框 */}
      <ApiKeyInputSection
        llmApiKey={llmApiKey}
        setLlmApiKey={setLlmApiKey}
        currentLLM={currentLLM}
        showApiKeyInput={showApiKeyInput}
        setShowApiKeyInput={setShowApiKeyInput}
        saveApiKey={saveApiKey}
      />

      {/* 语言选择器和大模型设置按钮 */}
      <LanguageSelectionSection
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        setSourceLanguage={setSourceLanguage}
        setTargetLanguage={setTargetLanguage}
        handleSwapLanguages={handleSwapLanguages}
        languages={LANGUAGES}
        useLLM={useLLM}
        currentLLM={currentLLM}
      />

      {/* 翻译卡片区域 */}
      <TranslationContent
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        sourceText={sourceText}
        translatedText={translatedText}
        isTranslating={isTranslating}
        translationError={translationError}
        setSourceText={setSourceText}
        handleRetryTranslation={handleRetryTranslation}
      />

      {/* 功能按钮 */}
      <ActionButtons
        isListening={isListening}
        isSpeaking={isSpeaking}
        translatedText={translatedText}
        isTranslating={isTranslating}
        handleVoiceInput={handleVoiceInput}
        handleTextToSpeech={handleTextToSpeech}
        openSettingsModal={openSettingsModal}
      />
    </TranslationLayout>
  );
};

export default Index;
