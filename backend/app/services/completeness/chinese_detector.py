# @AI-Generated
"""
中文完整性检测器
"""
import re

def is_chinese_sentence_complete(text: str) -> bool:
    """
    判断中文句子或词汇是否完整（规则判断，非AI）
    :param text: 待判断文本
    :return: 是否为完整表达
    """
    if not text or len(text.strip()) < 1:
        return False
    trimmed = text.strip()
    # 1. 判断是否为单个词/短语（无标点、无空格、无连接词，且为纯中文）
    # 允许 1~4 字的纯中文短语直接视为完整表达
    if 1 <= len(trimmed) <= 4:
        # 只包含中文字符
        if re.fullmatch(r'[\u4e00-\u9fa5]+', trimmed):
            return True
    # 2. 原有句子完整性判断
    last_char = trimmed[-1]
    # 完整标点
    ending_punct = '。！？…；：?!;:'
    ends_with_punct = last_char in ending_punct
    # 未闭合标点
    open_quotes = sum(trimmed.count(c) for c in '「『（')
    close_quotes = sum(trimmed.count(c) for c in '」』）')
    has_unclosed = open_quotes != close_quotes
    # 常见连接词
    conjunctions = ['和', '或', '但', '因为', '所以', '如果', '但是', '而且', '并且', '虽然', '然而', '而', '且', '及', '与', '并', '而是']
    ends_with_conj = any(trimmed.endswith(conj) for conj in conjunctions)
    has_min_length = len(trimmed) >= 4
    is_long_enough = len(trimmed) >= 8 and not ends_with_conj
    is_question = any(x in trimmed for x in ['吗', '呢', '？', '什么', '谁', '哪', '怎', '为什么'])
    is_semantic_complete = has_min_length and not ends_with_conj and len(trimmed) >= 6
    # 仅当以完整标点结束且无未闭合元素时认为完整
    return ends_with_punct and not has_unclosed 