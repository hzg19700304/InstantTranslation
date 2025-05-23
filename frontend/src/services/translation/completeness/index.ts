// @AI-Generated
/**
 * 文本完整性检测功能集合（全部通过后端API）
 */
import { request } from './request';
import { useLLMSettings } from '@/hooks/translation/useLLMSettings';

/**
 * 测试大模型连通性
 */
export async function testLLMConnection(provider: string, apiKey: string): Promise<{ ok: boolean; message: string }> {
  const start = Date.now();
  const res = await request.post('/api/translation/test-connection', {
    provider,
    api_key: apiKey,
  });
  const duration = Date.now() - start;
  // 输出大模型连通性测试耗时
  console.log(`[testLLMConnection] , 响应时间: ${duration}ms`);
  return res;
}

/**
 * 检查输入是否完整
 */
export async function isInputComplete(sourceText: string, sourceLanguageCode: string, llmApiKey: string, currentLLM: string, context?: string): Promise<boolean> {
  const res = await request.post('/api/translation/completeness/input', {
    source_text: sourceText,
    source_language_code: sourceLanguageCode,
    context,
    llm_api_key: llmApiKey,
    llm_provider: currentLLM
  });
  return res.is_complete;
}

/**
 * 检查是否应触发翻译
 */
export async function shouldTranslate(sourceText: string, sourceLanguageCode: string, lastTranslatedText: string, isFirstTranslation: boolean, llmApiKey?: string): Promise<boolean> {
  const res = await request.post('/api/translation/completeness/trigger', {
    source_text: sourceText,
    source_language_code: sourceLanguageCode,
    last_translated_text: lastTranslatedText,
    is_first_translation: isFirstTranslation,
    llm_api_key: llmApiKey || null,
  });
  return res.should_translate;
}

/**
 * 检查英文句子是否完整
 */
export async function isEnglishSentenceComplete(text: string): Promise<boolean> {
  const res = await request.post('/api/translation/completeness/english', { text });
  return res.is_complete;
}

/**
 * 检查中文句子是否完整
 */
export async function isChineseSentenceComplete(text: string): Promise<boolean> {
  const res = await request.post('/api/translation/chinese-completeness', { text });
  return res.is_complete;
}

/**
 * 增强版停顿/完整性检测
 */
export async function shouldTranslateEx(sourceText: string, sourceLanguageCode: string, lastTranslatedText: string, isFirstTranslation: boolean, llmApiKey: string, currentLLM: string): Promise<boolean> {
  const res = await request.post('/api/translation/completeness/trigger-ex', {
    source_text: sourceText,
    source_language_code: sourceLanguageCode,
    last_translated_text: lastTranslatedText,
    is_first_translation: isFirstTranslation,
    llm_api_key: llmApiKey,
    llm_provider: currentLLM
  });
  return res.should_translate;
}
