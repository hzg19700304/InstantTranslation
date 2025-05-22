
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
  
  // 检查是否有明显的未完成单词 (词尾被截断)
  if (text.endsWith(' ') || /[a-z][A-Z]$/.test(text)) {
    return false;
  }
  
  // 检测输入中有未闭合标点的情况
  const openQuotes = (text.match(/"/g) || []).length;
  const openParentheses = (text.match(/\(/g) || []).length;
  const closeParentheses = (text.match(/\)/g) || []).length;
  
  if ((openQuotes % 2 !== 0) || (openParentheses !== closeParentheses)) {
    return false;
  }
  
  // 根据语言应用相应的完整性检查
  if (languageCode === 'zh') {
    return isChineseSentenceComplete(text);
  } else if (languageCode === 'en') {
    // 英文句子完整性检查 - 更严格检查
    const result = isEnglishSentenceComplete(text);
    
    // 特殊情况检查 - 常见的明显不完整词组
    const commonIncompleteEndings = [
      'to ', 'and ', 'or ', 'the ', 'a ', 'an ', 'in ', 'on ', 'at ', 'with ', 'by ', 'as ', 
      'for ', 'from ', 'of ', 'about ', 'than '
    ];
    
    if (commonIncompleteEndings.some(ending => text.trim().endsWith(ending.trim()))) {
      return false;
    }
    
    // 检查英文句子是否只有几个单词且没有标点 (更可能是不完整的)
    const words = text.trim().split(/\s+/);
    if (words.length <= 3 && !/[.?!,;:]/.test(text)) {
      return false;
    }
    
    return result;
  }
  
  // 通用检查 - 如果没有语言特定规则，检查是否是合理长度
  return text.trim().length >= 6;
}
