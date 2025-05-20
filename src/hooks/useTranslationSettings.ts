
import { useState, useCallback } from "react";
import { useLLMSettings } from "@/hooks/translation/useLLMSettings";

export const useTranslationSettings = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const llmSettings = useLLMSettings();

  // 打开设置模态框
  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  // 关闭设置模态框
  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  return {
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    ...llmSettings
  };
};
