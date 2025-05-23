# @AI-Generated
"""
输入检测器
"""
from .constants import INCOMPLETE_ENDING_CHARS
from .chinese_detector import is_chinese_sentence_complete
from .english_detector import is_english_sentence_complete
from .llm_detector import is_sentence_complete_by_llm, is_translatable_word
import re

async def is_input_complete(text: str, language_code: str, llm_api_key: str = None, context: str = None, provider: str = None) -> bool:
    """
    智能检测文本输入是否看起来已经完整，支持多语言和上下文
    :param text: 用户输入的文本
    :param language_code: 当前输入语言代码
    :param llm_api_key: 可选的LLM API密钥
    :param context: 上下文（可选）
    :param provider: LLM 服务商（如 deepseek、chatgpt 等，可选）
    :return: 布尔值表示文本是否可能完整
    """
    # 优先用 LLM 检查是否为可直接翻译的表达（词/短语/句子），支持上下文
    if llm_api_key:
        try:
            is_word = await is_translatable_word(text, llm_api_key, context, provider)
            if is_word:
                return True
        except Exception:
            pass  # LLM 检查异常时降级为本地规则
    # 本地规则兜底
    if not text or len(text.strip()) <= 2:
        return False
    trimmed = text.strip()
    last_char = trimmed[-1]
    if last_char in INCOMPLETE_ENDING_CHARS:
        return False
    if trimmed.endswith(' ') or re.search(r'[a-z][A-Z]$', trimmed):
        return False
    open_quotes = len(re.findall(r'"', trimmed))
    open_parentheses = len(re.findall(r'\(', trimmed))
    close_parentheses = len(re.findall(r'\)', trimmed))
    if (open_quotes % 2 != 0) or (open_parentheses != close_parentheses):
        return False
    if llm_api_key:
        try:
            llm_result = await is_sentence_complete_by_llm(text, llm_api_key, context, provider)
            if llm_result:
                return True
        except Exception:
            pass
    # 语言分支
    if language_code == 'zh':
        return is_chinese_sentence_complete(text)
    elif language_code == 'en':
        result = is_english_sentence_complete(text)
        common_incomplete_endings = [
            'to ', 'and ', 'or ', 'the ', 'a ', 'an ', 'in ', 'on ', 'at ', 'with ', 'by ', 'as ',
            'for ', 'from ', 'of ', 'about ', 'than '
        ]
        if any(trimmed.endswith(e.strip()) for e in common_incomplete_endings):
            return False
        words = trimmed.split()
        if len(words) <= 3 and not re.search(r'[.?!,;:]', trimmed):
            return False
        return result
    elif language_code in ['ja', 'ko', 'de', 'fr', 'es', 'it', 'ru', 'pt', 'vi', 'th']:
        # 日语、韩语、德语、法语、西班牙语、意大利语、俄语、葡萄牙语、越南语、泰语等
        # 规则：长度大于等于4，或以常见句末标点结尾
        ending_punct = '。！？.!?;；'  # 兼容中西标点
        if len(trimmed) >= 4:
            return True
        if trimmed[-1] in ending_punct:
            return True
        # 允许 1~4 字母/字符的短词
        if 1 <= len(trimmed) <= 4 and re.fullmatch(r'\w+', trimmed):
            return True
        return False
    else:
        # 其他未知语言，兜底：长度大于等于4或以标点结尾
        ending_punct = '。！？.!?;；'
        if len(trimmed) >= 4:
            return True
        if trimmed[-1] in ending_punct:
            return True
        return False 