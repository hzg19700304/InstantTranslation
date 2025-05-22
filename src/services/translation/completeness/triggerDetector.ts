
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
  
  // 避免重复翻译相同的文本
  if (sourceText === lastTranslatedText && !isFirstTranslation) {
    return false;
  }
  
  // 检测用户是否停止输入（文本没有变化）
  const textUnchanged = sourceText === lastInputText;
  if (textUnchanged) {
    pauseCounter++;
  } else {
    pauseCounter = 0;
    lastInputText = sourceText;
    // 重置最后一次检查时间，用于计时器
    lastInputCheckTime = currentTime;
  }
  
  // 如果用户停止输入超过3次检查，认为可能已经完成输入
  const userPausedTyping = pauseCounter >= 3;
  
  // 检查用户是否暂停输入的时间
  const userPauseTime = currentTime - lastInputCheckTime;
  const wordCount = sourceText.trim().split(/\s+/).length;
  
  // 单词长度适中或较长时，应该更快触发翻译
  const isMediumWord = sourceText.trim().length >= 3;
  
  // 根据输入的单词数量和长度调整暂停阈值：
  // - 单个较短单词：800毫秒
  // - 单个中等长度以上单词：500毫秒
  // - 多个单词：需要更长时间确认是否完成，800毫秒
  const pauseThreshold = wordCount <= 1 ? (isMediumWord ? 500 : 800) : 800;
  const userPausedLongEnough = userPauseTime >= pauseThreshold;
  
  // 单个单词且已暂停足够时间就触发翻译
  if (wordCount <= 2 && userPausedLongEnough) {
    console.log("单词输入暂停触发翻译:", { 
      暂停时长: userPauseTime,
      单词: sourceText,
      暂停阈值: pauseThreshold
    });
    return true;
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
    
    // 检查是否已经过了时间阈值或连续判定多次为完整
    // 时间阈值：如果是中文，设置更短的延迟，因为中文通常不需要太长的停顿判断
    const timeThreshold = sourceLanguageCode === 'zh' ? 500 : 600; // 降低阈值，提高响应速度
    const hasExceededTimeThreshold = (currentTime - lastInputCheckTime) >= timeThreshold;
    const shouldTriggeredByConsecutiveChecks = consecutiveCompleteCount >= 1; // 只要判定为完整就触发
    
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
  }
  
  // 如果文本不完整但长度大于2个字符，检查是否停顿了足够长的时间
  if (!isComplete && sourceText.trim().length >= 2 && userPausedLongEnough) {
    console.log("不完整文本停顿触发翻译:", { 
      停顿时长: userPauseTime, 
      文本: sourceText,
      暂停阈值: pauseThreshold 
    });
    pauseCounter = 0;
    return true;
  }
  
  // 不触发翻译
  return false;
}
