# @AI-Generated
"""
completeness 检测相关常量
"""

# 句子结束标点
SENTENCE_ENDING_PUNCTUATION = {
    'common': ['.', '!', '?', ';', '。', '！', '？', '；'],
    'chinese': ['。', '！', '？', '；', '…', '：'],
    'english': ['.', '!', '?', ';'],
}

# 不完整句子的结束字符
INCOMPLETE_ENDING_CHARS = [
    '(', '[', '{', '"', "'",  # 括号引号类
    '，', '、', '：', '-', '=', '+', '<', '>', '/',  # 符号类
]

# 英文常见连接词，如果句子以这些词结尾，很可能不完整
ENGLISH_CONJUNCTIONS = [
    'and', 'or', 'but', 'so', 'because', 'if', 'when', 'while',
    'although', 'since', 'unless', 'whether', 'after', 'before',
    'as', 'than', 'that', 'though', 'till', 'until', 'where', 'wherever',
    'the', 'a', 'an'
]

# 英文介词，如果句子以这些词结尾，很可能不完整
ENGLISH_PREPOSITIONS = [
    'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among',
    'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'beyond', 'by', 'down', 'during', 'except', 'for', 'from', 'in', 'inside',
    'into', 'like', 'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over',
    'past', 'regarding', 'round', 'since', 'through', 'throughout', 'to', 'toward',
    'under', 'underneath', 'until', 'unto', 'up', 'upon', 'with', 'within', 'without'
]

# 中文常见连接词，如果句子以这些词结尾，很可能不完整
CHINESE_CONJUNCTIONS = [
    '和', '与', '以及', '而且', '并且', '但是', '然而', '可是', '不过',
    '因为', '由于', '所以', '因此', '如果', '假如', '除非', '虽然',
    '尽管', '即使', '无论', '不管', '还是', '或者', '的', '地', '得',
    '了', '着', '过'
] 