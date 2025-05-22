import React from "react";
import { LANGUAGES } from "@/constants/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechFeatures } from "@/hooks/useSpeechFeatures";
import { useTranslationSettings } from "@/hooks/useTranslationSettings";
import { useMobilePlatform } from "@/hooks/use-mobile-platform";
import TranslationLayout from "@/components/translation/TranslationLayout";
import ApiKeyInputSection from "@/components/translation/ApiKeyInputSection";
import LanguageSelectionSection from "@/components/translation/LanguageSelectionSection";
import TranslationContent from "@/components/translation/TranslationContent";
import ActionButtons from "@/components/translation/ActionButtons";

const Index = () => {
  // 检测当前运行平台
  const { isNative, isAndroid } = useMobilePlatform();

  // 初始化翻译设置
  const {
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    llmApiKey,
    setLlmApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    currentLLM,
    setCurrentLLM,
    saveApiKey,
    currentSpeechModel,
    setCurrentSpeechModel,
    speechApiKey,
    setSpeechApiKey
  } = useTranslationSettings();

  // 初始化翻译功能
  const {
    sourceText,
    setSourceText,
    translatedText,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    isTranslating,
    translationError,
    translationHistory,
    clearTranslation,
    handleSwapLanguages,
    handleRetryTranslation
  } = useTranslation({ 
    initialSourceLanguage: LANGUAGES[1], // 英语
    initialTargetLanguage: LANGUAGES[0], // 中文
  });

  // 初始化语音功能
  const {
    isListening,
    isSpeaking,
    speechSupported,
    handleVoiceInput,
    handleTextToSpeech
  } = useSpeechFeatures({
    sourceText,
    setSourceText,
    translatedText,
    sourceLanguageCode: sourceLanguage.code,
    sourceLanguageName: sourceLanguage.name,
    targetLanguageCode: targetLanguage.code,
    currentSpeechModel,
    speechApiKey
  });

  return (
    <TranslationLayout
      isSettingsModalOpen={isSettingsModalOpen}
      openSettingsModal={openSettingsModal}
      onCloseSettingsModal={closeSettingsModal}
      currentLLM={currentLLM}
      setCurrentLLM={setCurrentLLM}
      llmApiKey={llmApiKey}
      setLlmApiKey={setLlmApiKey}
      currentSpeechModel={currentSpeechModel}
      setCurrentSpeechModel={setCurrentSpeechModel}
      speechApiKey={speechApiKey}
      setSpeechApiKey={setSpeechApiKey}
      isNative={isNative}
      isAndroid={isAndroid}
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
        useLLM={true}
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
        translationHistory={translationHistory}
        handleClearTranslation={clearTranslation}
        currentSpeechModel={currentSpeechModel}
        speechApiKey={speechApiKey}
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
        speechSupported={speechSupported}
      />
    </TranslationLayout>
  );
};

export default Index;
