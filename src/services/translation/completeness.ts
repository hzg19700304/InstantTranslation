
/**
 * 判断用户输入的文本是否可能已经完整
 * 通过标点符号、句子结构和语言特征来判断
 */

// 句子结束标点
const SENTENCE_ENDING_PUNCTUATION = {
  common: ['.', '!', '?', ';', '。', '！', '？', '；'],
  chinese: ['。', '！', '？', '；', '…', '：'],
  english: ['.', '!', '?', ';'],
};

// 不完整句子的结束字符
const INCOMPLETE_ENDING_CHARS = [
  '(', '[', '{', '"', "'",  // 括号引号类
  '，', '、', '：', '-', '=', '+', '<', '>', '/',  // 符号类
];

// 判断英文句子是否完整
const isEnglishSentenceComplete = (text: string): boolean => {
  if (!text || text.length < 5) return false;
  
  // 检查是否以完整标点结束
  const lastChar = text.trim().slice(-1);
  const endsWithProperPunctuation = SENTENCE_ENDING_PUNCTUATION.english.includes(lastChar);
  
  // 检查最后一个单词是否完整 (简单检查 - 如果最后一个单词只有1-2个字母可能不完整)
  const lastWordIncomplete = /\b\w{1,2}\s*$/.test(text);
  
  // 检查是否有未闭合的引号或括号
  const openQuotes = (text.match(/"/g) || []).length;
  const openParentheses = (text.match(/\(/g) || []).length;
  const closeParentheses = (text.match(/\)/g) || []).length;
  const hasUnclosedElements = 
    (openQuotes % 2 !== 0) || 
    (openParentheses !== closeParentheses);
  
  return endsWithProperPunctuation && !lastWordIncomplete && !hasUnclosedElements;
};

// 判断中文句子是否完整
const isChineseSentenceComplete = (text: string): boolean => {
  if (!text || text.length < 3) return false;
  
  // 检查是否以完整标点结束
  const lastChar = text.trim().slice(-1);
  const endsWithProperPunctuation = SENTENCE_ENDING_PUNCTUATION.chinese.includes(lastChar);
  
  // 检查是否有未闭合的标点
  const openQuotes = (text.match(/[「『（]/g) || []).length;
  const closeQuotes = (text.match(/[」』）]/g) || []).length;
  const hasUnclosedElements = openQuotes !== closeQuotes;
  
  // 检查一些中文特有的短语模式
  const hasIncompletePattern = /(的|地|得|和|与|或|及|并|而|但)$/.test(text.trim());
  
  return endsWithProperPunctuation && !hasUnclosedElements && !hasIncompletePattern;
};

/**
 * 智能检测文本输入是否看起来已经完整
 * @param text 用户输入的文本
 * @param languageCode 当前输入语言代码
 * @returns 布尔值表示文本是否可能完整
 */
export function isInputComplete(text: string, languageCode: string): boolean {
  // 基本检查 - 太短的文本视为不完整
  if (!text || text.trim().length <= 8) {
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
    return isEnglishSentenceComplete(text);
  }
  
  // 通用检查 - 如果没有语言特定规则，检查是否以句号结束标点符号结束
  return SENTENCE_ENDING_PUNCTUATION.common.some(punct => text.trim().endsWith(punct));
}

/**
 * 检查文本是否符合翻译条件
 * 结合了文本长度、完整性和避免重复翻译的逻辑
 */
export function shouldTranslate(
  sourceText: string, 
  sourceLanguageCode: string,
  lastTranslatedText: string,
  isFirstTranslation: boolean
): boolean {
  // 空文本不翻译
  if (!sourceText.trim()) {
    return false;
  }
  
  // 避免重复翻译相同的文本
  if (sourceText === lastTranslatedText && !isFirstTranslation) {
    return false;
  }
  
  // 文本太短不翻译
  if (sourceText.trim().length <= 8) {
    return false;
  }
  
  // 检查输入是否完整
  return isInputComplete(sourceText, sourceLanguageCode);
}
