import { useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";

interface UseTranslationTimerProps {
  getSourceText: () => string;
  translationTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  performTranslation: () => Promise<void>;
  dependencies: any[];
  lastInputChangeTimeRef: React.MutableRefObject<number>;
}

/**
 * 处理翻译延迟计时器逻辑（防抖版）
 * @AI-Generated
 */
export const useTranslationTimer = ({
  getSourceText,
  translationTimeoutRef,
  performTranslation,
  dependencies,
  lastInputChangeTimeRef
}: UseTranslationTimerProps) => {
  // 用于防抖的ref，确保每次都是同一个debounced函数
  const debouncedTranslate = useRef(
    debounce(async () => {
      const now = Date.now();
      const pause = now - (lastInputChangeTimeRef?.current ?? 0);
      // 2秒防抖，只有停顿2秒后才自动翻译
      const sourceText = getSourceText();
      if (!sourceText) {
        // 空文本不触发翻译
        console.log('[useTranslationTimer] sourceText为空，不触发翻译');
        return;
      }
      if (pause >= 2000) {
        console.log('[useTranslationTimer] 停顿检测通过，自动翻译，停顿(ms):', pause, 'sourceText:', sourceText);
        await performTranslation();
      } else {
        console.log('[useTranslationTimer] 停顿未达阈值，不翻译，停顿(ms):', pause);
      }
    }, 2000)
  ).current;

  // 监听依赖变化，延迟自动翻译（防抖）
  useEffect(() => {
    if (getSourceText()) {
      debouncedTranslate();
    } else {
      // 清理防抖计时器，避免空文本时还触发
      debouncedTranslate.cancel();
    }
    // 组件卸载时清理计时器
    return () => {
      debouncedTranslate.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSourceText, ...dependencies]);

  return {
    setTranslationTimer: debouncedTranslate
  };
};
