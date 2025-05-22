
import { ENGLISH_CONJUNCTIONS, ENGLISH_PREPOSITIONS, SENTENCE_ENDING_PUNCTUATION } from './constants';

/**
 * 判断英文句子是否完整
 */
export const isEnglishSentenceComplete = (text: string): boolean => {
  if (!text || text.length < 5) return false;
  
  const trimmedText = text.trim();
  const lastChar = trimmedText.slice(-1);
  
  // 检查是否以完整标点结束
  const endsWithProperPunctuation = SENTENCE_ENDING_PUNCTUATION.english.includes(lastChar);
  
  // 截取最后一个单词
  const words = trimmedText.split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^\w]/g, '');
  
  // 检查最后一个单词是否是连接词或介词，这通常表示句子不完整
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
  const containsVerb = /\b(am|is|are|was|were|be|being|been|do|does|did|have|has|had|can|could|will|would|shall|should|may|might|must|ought)\b/i.test(trimmedText) || 
                      /\b\w+(?:s|ed|ing)\b/i.test(trimmedText);
  
  // 语义完整性检查 - 即使没有句号，如果句子结构完整也应该被认为是完整的
  const isSemanticComplete = hasMinimumWords && containsVerb && !endsWithConjunctionOrPreposition;
  
  // 检查是否是截断的单词 - 如果最后一个单词非常短，并且不是常见的短单词
  const commonShortWords = ['a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'i', 'it', 'he', 'we', 'no', 'yes', 'so'];
  const lastWordIsTruncated = lastWord.length <= 1 && !commonShortWords.includes(lastWord);
  
  // 特殊检查: 如果最后一个词是单个字母（可能是被截断的单词），则句子不完整
  if (lastWordIsTruncated) {
    return false;
  }
  
  // 结合多种条件判断句子完整性
  return (endsWithProperPunctuation && !hasUnclosedElements) || 
         (isSemanticComplete && !hasUnclosedElements && wordCount >= 4);
};
