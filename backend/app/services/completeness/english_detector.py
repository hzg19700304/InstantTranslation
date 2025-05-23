# @AI-Generated
"""
英文完整性检测器
"""
from .constants import ENGLISH_CONJUNCTIONS, ENGLISH_PREPOSITIONS, SENTENCE_ENDING_PUNCTUATION
import re

def is_english_sentence_complete(text: str) -> bool:
    """
    判断英文句子是否完整
    :param text: 英文文本
    :return: 是否完整
    """
    if not text or len(text) < 5:
        return False
    trimmed_text = text.strip()
    last_char = trimmed_text[-1]
    # 检查是否以完整标点结束
    ends_with_proper_punctuation = last_char in SENTENCE_ENDING_PUNCTUATION['english']
    # 截取最后一个单词
    words = re.split(r'\s+', trimmed_text)
    last_word = re.sub(r'[^\w]', '', words[-1].lower())
    # 检查最后一个单词是否是连接词或介词
    ends_with_conj_or_prep = last_word in ENGLISH_CONJUNCTIONS or last_word in ENGLISH_PREPOSITIONS
    # 检查未闭合引号或括号
    open_quotes = len(re.findall(r'"', text))
    open_parentheses = len(re.findall(r'\(', text))
    close_parentheses = len(re.findall(r'\)', text))
    has_unclosed = (open_quotes % 2 != 0) or (open_parentheses != close_parentheses)
    # 最小单词数
    word_count = len(words)
    has_min_words = word_count >= 3
    # 简单谓语检测
    contains_verb = bool(re.search(r'\b(am|is|are|was|were|be|being|been|do|does|did|have|has|had|can|could|will|would|shall|should|may|might|must|ought)\b', trimmed_text, re.I)) or bool(re.search(r'\b\w+(?:s|ed|ing)\b', trimmed_text, re.I))
    is_semantic_complete = has_min_words and contains_verb and not ends_with_conj_or_prep
    # 截断检测
    is_last_word_truncated = len(last_word) <= 2 and last_word not in ['a', 'an', 'i', 'be', 'do', 'to', 'so', 'no', 'of', 'he', 'by', 'we']
    is_possibly_truncated = any(trimmed_text.endswith(x) for x in ['and', 'or', 'but', 'to', 'the'])
    ends_with_incomplete_phrase = bool(re.search(r'\b(in order|as well as|such as|more than|rather than|due to|according to|based on|refers to|related to|compared to|contrary to|similar to|for example|in terms of|in other words|on the other hand)\s*$', trimmed_text))
    if ends_with_conj_or_prep or is_possibly_truncated or is_last_word_truncated or ends_with_incomplete_phrase:
        return False
    return (ends_with_proper_punctuation and not has_unclosed) or (is_semantic_complete and not has_unclosed and word_count >= 4 and not is_possibly_truncated) 