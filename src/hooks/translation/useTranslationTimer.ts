
import { useEffect, useCallback } from "react";

interface UseTranslationTimerProps {
  sourceText: string;
  translationTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  performTranslation: () => Promise<void>;
  dependencies: any[];
}

/**
 * 处理翻译延迟计时器逻辑
 */
export const useTranslationTimer = ({
  sourceText,
  translationTimeoutRef,
  performTranslation,
  dependencies
}: UseTranslationTimerProps) => {
  
  // 设置计时器
  const setTranslationTimer = useCallback((delay: number = 500) => {
    // 取消之前的计时器
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    // 设置新的计时器
    translationTimeoutRef.current = setTimeout(() => {
      performTranslation();
    }, delay);
    
  }, [performTranslation, translationTimeoutRef]);
  
  // 监听文本变化，延迟自动翻译
  useEffect(() => {
    if (sourceText) {
      setTranslationTimer();
    }
    
    // 组件卸载时清理计时器
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, ...dependencies]);
  
  return {
    setTranslationTimer
  };
};
