
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

// 英文常见连接词，如果句子以这些词结尾，很可能不完整
const ENGLISH_CONJUNCTIONS = [
  'and', 'or', 'but', 'so', 'because', 'if', 'when', 'while', 
  'although', 'since', 'unless', 'whether', 'after', 'before',
  'as', 'than', 'that', 'though', 'till', 'until', 'where', 'wherever',
  'the', 'a', 'an'
];

// 英文介词，如果句子以这些词结尾，很可能不完整
const ENGLISH_PREPOSITIONS = [
  'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among',
  'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
  'beyond', 'by', 'down', 'during', 'except', 'for', 'from', 'in', 'inside',
  'into', 'like', 'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over',
  'past', 'regarding', 'round', 'since', 'through', 'throughout', 'to', 'toward',
  'under', 'underneath', 'until', 'unto', 'up', 'upon', 'with', 'within', 'without'
];

// 中文常见连接词，如果句子以这些词结尾，很可能不完整
const CHINESE_CONJUNCTIONS = [
  '和', '与', '以及', '而且', '并且', '但是', '然而', '可是', '不过',
  '因为', '由于', '所以', '因此', '如果', '假如', '除非', '虽然', 
  '尽管', '即使', '无论', '不管', '还是', '或者', '的', '地', '得', 
  '了', '着', '过'
];

// 判断英文句子是否完整
const isEnglishSentenceComplete = (text: string): boolean => {
  if (!text || text.length < 5) return false;
  
  const trimmedText = text.trim();
  const lastChar = trimmedText.slice(-1);
  
  // 检查是否以完整标点结束
  const endsWithProperPunctuation = SENTENCE_ENDING_PUNCTUATION.english.includes(lastChar);
  
  // 截取最后一个单词
  const words = trimmedText.split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^\w]/g, '');
  
  // 检查最后一个单词是否是连接词或介词
  const endsWithConjunctionOrPreposition = 
    ENGLISH_CONJUNCTIONS.includes(lastWord) || 
    ENGLISH_PREPOSITIONS.includes(lastWord);
  
  // 检查是否有未闭合的引号或括号
  const openQuotes = (text.match(/"/g) || []).length;
  const openParentheses = (text.match(/\(/g) || []).length;
  const closeParentheses = (text.match(/\)/g) || []).length;
  const hasUnclosedElements = 
    (openQuotes % 2 !== 0) || 
    (openParentheses !== closeParentheses);
  
  // 检查最小句子长度 (基于单词数量)
  const wordCount = words.length;
  const hasMinimumWords = wordCount >= 3; // 大多数完整句子至少有3个单词
  
  // 检查语法结构 - 确保有主语和谓语 (简单检查)
  // 大多数英文句子应该至少有一个主语和一个动词
  const containsVerb = /\b(am|is|are|was|were|be|being|been|do|does|did|have|has|had|can|could|will|would|shall|should|may|might|must|ought)\b/i.test(trimmedText) || 
                      /\b\w+(?:s|ed|ing)\b/i.test(trimmedText);
  
  // 语义完整性检查 - 即使没有句号，如果句子结构完整也应该被认为是完整的
  const isSemanticComplete = hasMinimumWords && containsVerb && !endsWithConjunctionOrPreposition;
  
  // 结合多种条件判断句子完整性
  return endsWithProperPunctuation || 
         (isSemanticComplete && !hasUnclosedElements) || 
         (wordCount >= 5 && !endsWithConjunctionOrPreposition && !hasUnclosedElements);
};

// 判断中文句子是否完整
const isChineseSentenceComplete = (text: string): boolean => {
  if (!text || text.length < 3) return false;
  
  const trimmedText = text.trim();
  const lastChar = trimmedText.slice(-1);
  
  // 检查是否以完整标点结束
  const endsWithProperPunctuation = SENTENCE_ENDING_PUNCTUATION.chinese.includes(lastChar);
  
  // 检查是否有未闭合的标点
  const openQuotes = (trimmedText.match(/[「『（]/g) || []).length;
  const closeQuotes = (trimmedText.match(/[」』）]/g) || []).length;
  const hasUnclosedElements = openQuotes !== closeQuotes;
  
  // 检查一些中文特有的短语模式
  const endsWithConjunction = CHINESE_CONJUNCTIONS.some(conj => trimmedText.endsWith(conj));
  
  // 检查最小句子长度 (中文通常不用空格分词，所以直接检查字符数)
  const hasMinimumLength = trimmedText.length >= 5; // 大多数完整中文句子至少有5个字符
  
  // 检查特殊句型 - 中文问句通常会有特定结构
  const isQuestion = trimmedText.includes('吗') || 
                    trimmedText.includes('呢') || 
                    trimmedText.includes('？') ||
                    /什么|谁|哪|怎|为什么/.test(trimmedText);
  
  // 语义完整性检查 - 即使没有句号，如果内容足够长并且不是以连接词结尾，也可能是完整句子
  const isSemanticComplete = hasMinimumLength && !endsWithConjunction && trimmedText.length >= 10;
  
  // 结合多种条件判断句子完整性
  return endsWithProperPunctuation || 
         (isSemanticComplete && !hasUnclosedElements) || 
         (trimmedText.length >= 15 && !endsWithConjunction && !hasUnclosedElements) ||
         (isQuestion && !endsWithConjunction && !hasUnclosedElements);
};

/**
 * 智能检测文本输入是否看起来已经完整
 * @param text 用户输入的文本
 * @param languageCode 当前输入语言代码
 * @returns 布尔值表示文本是否可能完整
 */
export function isInputComplete(text: string, languageCode: string): boolean {
  // 基本检查 - 太短的文本视为不完整
  if (!text || text.trim().length <= 5) {
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
  
  // 通用检查 - 如果没有语言特定规则，检查是否是合理长度
  // 不再强制要求必须以句号结束
  return text.trim().length >= 10;
}

// 上次输入检查的时间戳
let lastInputCheckTime = 0;

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
    return false;
  }
  
  // 避免重复翻译相同的文本
  if (sourceText === lastTranslatedText && !isFirstTranslation) {
    lastInputCheckTime = currentTime;
    return false;
  }
  
  // 文本太短不翻译 (减少最小长度要求)
  if (sourceText.trim().length < 5) {
    lastInputCheckTime = currentTime;
    return false;
  }
  
  // 检查输入是否完整
  const isComplete = isInputComplete(sourceText, sourceLanguageCode);
  
  // 如果文本已经完整，检查时间阈值 (如果停顿超过1秒，触发翻译)
  if (isComplete) {
    // 如果是首次翻译或者文本已变化，更新上次检查时间
    if (lastInputCheckTime === 0) {
      lastInputCheckTime = currentTime;
      return false;
    }
    
    // 检查是否已经过了时间阈值 (1000毫秒 = 1秒)
    const hasExceededTimeThreshold = (currentTime - lastInputCheckTime) >= 1000;
    
    // 如果超过了时间阈值，重置上次检查时间并触发翻译
    if (hasExceededTimeThreshold) {
      lastInputCheckTime = currentTime;
      return true;
    }
    
    // 未超过时间阈值，等待更长时间
    return false;
  }
  
  // 如果文本不完整，更新上次检查时间但不触发翻译
  lastInputCheckTime = currentTime;
  return false;
}
