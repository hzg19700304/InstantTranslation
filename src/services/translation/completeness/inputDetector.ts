
import { INCOMPLETE_ENDING_CHARS } from './constants';
import { isChineseSentenceComplete } from './chineseDetector';
import { isEnglishSentenceComplete } from './englishDetector';

/**
 * 智能检测文本输入是否看起来已经完整
 * @param text 用户输入的文本
 * @param languageCode 当前输入语言代码
 * @returns 布尔值表示文本是否可能完整
 */
export function isInputComplete(text: string, languageCode: string): boolean {
  // 基本检查 - 太短的文本视为不完整
  if (!text || text.trim().length <= 2) {
    return false;
  }
  
  // 检查是否以不完整的字符结尾
  const lastChar = text.trim().slice(-1);
  if (INCOMPLETE_ENDING_CHARS.includes(lastChar)) {
    return false;
  }
  
  // 根据语言应用相应的完整性检查
  if (languageCode === 'zh') {
    return isChineseSentenceComplete(text);
  } else if (languageCode === 'en') {
    // 英文句子完整性检查 - 更严格的检查
    const result = isEnglishSentenceComplete(text);
    
    // 特殊情况检查 - 如果文本太短或明显不完整
    // 例如："i see you want to enhance t" 明显是不完整的
    if (text.trim().length < 15 && !result) {
      return false;
    }
    
    return result;
  }
  
  // 通用检查 - 如果没有语言特定规则，检查是否是合理长度
  return text.trim().length >= 6;
}
