
import { useCallback } from "react";
import { toast } from "sonner";

interface UseTranslationRetryProps {
  lastTranslatedTextRef: React.MutableRefObject<string>;
  previousTranslationResultRef: React.MutableRefObject<string>;
  completeTranslationRef: React.MutableRefObject<string>;
  isFirstTranslationRef: React.MutableRefObject<boolean>;
  setRetryCount: (value: number | ((prevCount: number) => number)) => void;
}

/**
 * 处理翻译重试逻辑
 */
export const useTranslationRetry = ({
  lastTranslatedTextRef,
  previousTranslationResultRef,
  completeTranslationRef,
  isFirstTranslationRef,
  setRetryCount
}: UseTranslationRetryProps) => {
  
  // 手动重试翻译功能
  const handleRetryTranslation = useCallback(() => {
    lastTranslatedTextRef.current = "";
    previousTranslationResultRef.current = "";
    completeTranslationRef.current = "";
    isFirstTranslationRef.current = true;
    setRetryCount(prevCount => prevCount + 1);
    toast.info("正在重试翻译", {
      description: "尝试重新连接翻译服务..."
    });
  }, [setRetryCount, lastTranslatedTextRef, previousTranslationResultRef, completeTranslationRef, isFirstTranslationRef]);

  return { handleRetryTranslation };
};
