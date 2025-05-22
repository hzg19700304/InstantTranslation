
import { CHINESE_CONJUNCTIONS, SENTENCE_ENDING_PUNCTUATION } from './constants';

/**
 * 判断中文句子是否完整
 */
export const isChineseSentenceComplete = (text: string): boolean => {
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
