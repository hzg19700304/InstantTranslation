
import { request } from "./request";

/**
 * 检查语句是否完整
 */
export async function isInputComplete(
  text: string,
  languageCode: string,
  llmApiKey: string,
  llmProvider: string
): Promise<boolean> {
  try {
    // 空文本直接返回false
    if (!text || text.trim() === '') return false;
    
    console.log('[isInputComplete] 检查完整性入参:', { 
      text: text.substring(0, 20) + '...',
      languageCode,
      llmProvider,
      hasApiKey: !!llmApiKey
    });
    
    // 针对中文使用本地规则进行快速检查
    if (languageCode === 'zh' || languageCode === 'zh-CN' || languageCode === 'zh-TW') {
      try {
        const response = await request.post('/api/translation/chinese-completeness', { text });
        return response.is_complete;
      } catch (e) {
        console.error('中文句子完整性检查失败，使用后备方法', e);
        // 后备方法：检查中文句子是否以句号、问号、感叹号结尾
        return /[。？！.?!]$/.test(text.trim());
      }
    }
    
    // 针对其他语言，使用大模型进行完整性检查
    // 只有当文本长度超过特定值时才调用API
    if (text.length < 5) return false;
    
    // 对于没有API密钥的情况，使用简单规则检测
    if (!llmApiKey) {
      // 英语：检查是否以.!?结尾
      if (languageCode.startsWith('en')) {
        return /[.?!]$/.test(text.trim());
      }
      // 日语：检查是否以。？！结尾
      if (languageCode === 'ja') {
        return /[。？！.?!]$/.test(text.trim());
      }
      // 其他语言，假设句号结尾为完整
      return /[.。？！?!]$/.test(text.trim());
    }
    
    console.log('[isInputComplete] 尝试向后端请求完整性检查...');
    
    // 使用大模型API进行更准确的完整性检查
    try {
      const data = await request.post('/api/translation/completeness', {
        text,
        llm_api_key: llmApiKey,
        llm_provider: llmProvider
      });
      
      console.log('[isInputComplete] API返回结果:', data);
      
      // 保存检查结果到window对象便于其他组件使用
      (window as any).__lastCheck = {
        text,
        isComplete: data.is_complete,
        reason: data.reason
      };
      
      return data.is_complete;
    } catch (error) {
      console.error('完整性检查API调用失败:', error);
      
      // 使用简单规则作为后备方案
      const isComplete = /[.。？！?!]$/.test(text.trim());
      
      // 保存检查结果到window对象便于其他组件使用
      (window as any).__lastCheck = {
        text,
        isComplete,
        reason: '使用规则检查（API调用失败）'
      };
      
      return isComplete;
    }
  } catch (e) {
    console.error('完整性检查出错:', e);
    return true; // 出错时默认认为输入完整，避免阻止翻译
  }
}
