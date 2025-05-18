
import { useState, useCallback } from "react";
import { LLMProvider } from "@/services/translation/types";

export const useTranslationSettings = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
    closeSettingsModal
  };
};
