# @AI-Generated
"""
触发检测器
"""
import time
import re
from .input_detector import is_input_complete

# 触发检测相关常量
PAUSE_THRESHOLD_SHORT = 600  # ms，短文本停顿阈值
PAUSE_THRESHOLD_LONG = 800   # ms，长文本停顿阈值
TIME_THRESHOLD_ZH = 500      # ms，中文时间阈值
TIME_THRESHOLD_OTHER = 600   # ms，其他语言时间阈值
CONSECUTIVE_COMPLETE_LIMIT = 1  # 连续完整检测次数
PAUSE_COUNTER_LIMIT = 3      # 连续未变动计数

class InputTriggerDetector:
    """
    输入触发检测器，封装状态，支持多用户/多会话
    """
    def __init__(self):
        self._last_input_check_time = 0
        self._last_complete_text = ''
        self._consecutive_complete_count = 0
        self._pause_counter = 0
        self._last_input_text = ''

    def reset_state(self):
        self._last_input_check_time = 0
        self._consecutive_complete_count = 0
        self._last_input_text = ''
        self._pause_counter = 0
        self._last_complete_text = ''

    async def should_translate(self, source_text: str, source_language_code: str, last_translated_text: str, is_first_translation: bool, llm_api_key: str = None) -> bool:
        current_time = int(time.time() * 1000)
        if not source_text.strip():
            self.reset_state()
            return False
        if source_text == last_translated_text and not is_first_translation:
            return False
        text_unchanged = source_text == self._last_input_text
        if not text_unchanged:
            self._last_input_text = source_text
            self._last_input_check_time = current_time
            self._pause_counter = 0
        else:
            self._pause_counter += 1
        user_paused_typing = self._pause_counter >= PAUSE_COUNTER_LIMIT
        user_pause_time = current_time - self._last_input_check_time
        word_count = len(source_text.strip().split())
        pause_threshold = PAUSE_THRESHOLD_SHORT if word_count <= 2 else PAUSE_THRESHOLD_LONG
        user_paused_long_enough = user_pause_time >= pause_threshold
        if user_paused_long_enough:
            return True
        is_complete = await is_input_complete(source_text, source_language_code, llm_api_key)
        if is_complete:
            if source_text == self._last_complete_text:
                self._consecutive_complete_count += 1
            else:
                self._consecutive_complete_count = 1
                self._last_complete_text = source_text
            time_threshold = TIME_THRESHOLD_ZH if source_language_code == 'zh' else TIME_THRESHOLD_OTHER
            has_exceeded_time_threshold = (current_time - self._last_input_check_time) >= time_threshold
            should_triggered_by_consecutive_checks = self._consecutive_complete_count >= CONSECUTIVE_COMPLETE_LIMIT
            if has_exceeded_time_threshold or should_triggered_by_consecutive_checks or user_paused_typing:
                self._last_input_check_time = current_time
                self._consecutive_complete_count = 0
                self._pause_counter = 0
                return True
            self._last_input_check_time = current_time
        if not is_complete and len(source_text.strip()) >= 2 and user_paused_long_enough:
            self._pause_counter = 0
            return True
        return False

    async def should_translate_ex(self, source_text: str, source_language_code: str, llm_api_key: str = None) -> dict:
        """
        增强版停顿/完整性检测
        :return: { should: bool, is_complete: bool }
        """
        if not hasattr(self, '_last_input_time'):
            self._last_input_time = int(time.time() * 1000)
        is_complete = await is_input_complete(source_text, source_language_code, llm_api_key)
        has_latin = bool(re.search(r'[a-zA-Z]', source_text))
        has_cjk = bool(re.search(r'[\u4e00-\u9fa5]', source_text))
        if has_latin and has_cjk:
            is_complete = False
        now = int(time.time() * 1000)
        last = self._last_input_time
        pause = now - last
        word_count = len(source_text.strip().split())
        is_single_word = word_count == 1
        if is_single_word and pause >= PAUSE_THRESHOLD_SHORT:
            self._last_input_time = now
            return {"should": True, "is_complete": True}
        if not is_complete and pause >= PAUSE_THRESHOLD_LONG:
            self._last_input_time = now
            return {"should": True, "is_complete": False}
        if is_complete:
            self._last_input_time = now
            return {"should": True, "is_complete": True}
        return {"should": False, "is_complete": is_complete}

# 单例兼容原有用法
_detector_instance = InputTriggerDetector()

async def should_translate(source_text: str, source_language_code: str, last_translated_text: str, is_first_translation: bool, llm_api_key: str = None) -> bool:
    """
    兼容原有API，使用单例
    """
    return await _detector_instance.should_translate(source_text, source_language_code, last_translated_text, is_first_translation, llm_api_key)

async def should_translate_ex(source_text: str, source_language_code: str, llm_api_key: str = None) -> dict:
    """
    兼容原有API，使用单例
    """
    return await _detector_instance.should_translate_ex(source_text, source_language_code, llm_api_key) 