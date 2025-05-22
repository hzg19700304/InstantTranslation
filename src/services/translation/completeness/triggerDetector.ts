
import { isInputComplete } from './inputDetector';

// 状态变量
let lastInputCheckTime = 0;
let lastCompleteText = '';
let consecutiveCompleteCount = 0;
let pauseTimer: NodeJS.Timeout | null = null;
let lastInputText = '';
let pauseCounter = 0;

/**
 * 检查文本是否符合翻译条件
 * 结合了文本长度、完整性和时间阈值的逻辑
 */
export function shouldTranslate(
  sourceText: string, 
  sourceLanguageCode: string,
  lastTranslatedText: string,
  isFirstTranslation: boolean
): boolean {
  const currentTime = Date.now();
  
  // 空文本不翻译
  if (!sourceText.trim()) {
    lastInputCheckTime = currentTime;
    consecutiveCompleteCount = 0;
    lastInputText = '';
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
    pauseCounter = 0;
    return false;
  }
  
  // 检测用户是否停止输入（文本没有变化）
  const textUnchanged = sourceText === lastInputText;
  if (textUnchanged) {
    pauseCounter++;
  } else {
    pauseCounter = 0;
    lastInputText = sourceText;
  }
  
  // 如果用户停止输入超过3次检查，认为可能已经完成输入
  const userPausedTyping = pauseCounter >= 3;
  
  // 避免重复翻译相同的文本
  if (sourceText === lastTranslatedText && !isFirstTranslation) {
    lastInputCheckTime = currentTime;
    return false;
  }
  
  // 文本太短不翻译
  if (sourceText.trim().length < 2) {
    lastInputCheckTime = currentTime;
    consecutiveCompleteCount = 0;
    return false;
  }
  
  // 检查输入是否完整
  const isComplete = isInputComplete(sourceText, sourceLanguageCode);
  
  // 如果文本判断为完整
  if (isComplete) {
    // 如果文本内容与上次相同，且已被判定为完整，增加连续完整计数
    if (sourceText === lastCompleteText) {
      consecutiveCompleteCount += 1;
    } else {
      // 新的完整文本，重置计数
      consecutiveCompleteCount = 1;
      lastCompleteText = sourceText;
    }
    
    // 如果是首次翻译，更新时间戳但不立即触发
    if (lastInputCheckTime === 0) {
      lastInputCheckTime = currentTime;
      return false;
    }
    
    // 检查是否已经过了时间阈值或连续判定多次为完整
    // 时间阈值：如果是中文，设置更短的延迟，因为中文通常不需要太长的停顿判断
    const timeThreshold = sourceLanguageCode === 'zh' ? 600 : 800; // 中文600毫秒，其他800毫秒
    const hasExceededTimeThreshold = (currentTime - lastInputCheckTime) >= timeThreshold;
    const shouldTriggeredByConsecutiveChecks = consecutiveCompleteCount >= 2; // 连续2次判定为完整就触发翻译
    
    // 满足任一条件触发翻译
    if (hasExceededTimeThreshold || shouldTriggeredByConsecutiveChecks || userPausedTyping) {
      console.log("触发翻译：", { 
        时间阈值: hasExceededTimeThreshold, 
        连续完整: shouldTriggeredByConsecutiveChecks,
        用户停顿: userPausedTyping, 
        文本: sourceText 
      });
      
      // 重置状态
      lastInputCheckTime = currentTime;
      consecutiveCompleteCount = 0;
      pauseCounter = 0;
      return true;
    }
    
    // 更新时间戳以便下次检查
    lastInputCheckTime = currentTime;
    return false;
  }
  
  // 如果文本不完整，但用户停止输入超过一定次数，也可以触发翻译
  if (userPausedTyping && sourceText.trim().length >= 6) {
    console.log("用户停顿触发翻译:", { 停顿次数: pauseCounter, 文本: sourceText });
    pauseCounter = 0;
    return true;
  }
  
  // 如果文本不完整，重置连续完整计数，更新时间戳
  consecutiveCompleteCount = 0;
  lastInputCheckTime = currentTime;
  return false;
}
