
/**
 * 文本完整性检测功能集合
 */

// 导出完整性检测器
export { isInputComplete } from './inputDetector';

// 导出翻译触发器
export { shouldTranslate } from './triggerDetector';

// 导出语言特定检测器
export { isEnglishSentenceComplete } from './englishDetector';
export { isChineseSentenceComplete } from './chineseDetector';

// 导出常量
export * from './constants';
