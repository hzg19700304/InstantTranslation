
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
         (wordCount >= 4 && !endsWithConjunctionOrPreposition && !hasUnclosedElements);
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
  const hasMinimumLength = trimmedText.length >= 4; // 降低最小完整句子长度要求
  
  // 中文语义分析 - 特定长度与结构更可能表示完整句子
  // 检查如果句子有一定长度，且不是以连接词结尾，那么它可能是完整的
  const isLongEnoughToBeComplete = trimmedText.length >= 8 && !endsWithConjunction;
  
  // 检查特殊句型 - 中文问句通常会有特定结构
  const isQuestion = trimmedText.includes('吗') || 
                    trimmedText.includes('呢') || 
                    trimmedText.includes('？') ||
                    /什么|谁|哪|怎|为什么/.test(trimmedText);
  
  // 语义完整性检查 - 即使没有句号，如果内容足够长并且不是以连接词结尾，也可能是完整句子
  const isSemanticComplete = hasMinimumLength && !endsWithConjunction && trimmedText.length >= 6;
  
  // 结合多种条件判断句子完整性，大幅降低对标点符号的依赖
  return endsWithProperPunctuation || 
         isLongEnoughToBeComplete || 
         (isSemanticComplete && !hasUnclosedElements) ||
         (isQuestion && !endsWithConjunction) ||
         trimmedText.length >= 12; // 降低足够长文本的阈值
};

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
    return isEnglishSentenceComplete(text);
  }
  
  // 通用检查 - 如果没有语言特定规则，检查是否是合理长度
  // 不再强制要求必须以句号结束
  return text.trim().length >= 6;
}

// 上次输入检查的时间戳
let lastInputCheckTime = 0;
// 记录上次判定为完整的文本
let lastCompleteText = '';
// 连续判定为完整的次数，用于更快触发翻译
let consecutiveCompleteCount = 0;
// 文本停顿计时器
let pauseTimer: NodeJS.Timeout | null = null;
// 上次输入的文本
let lastInputText = '';
// 文本停顿计数器
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
