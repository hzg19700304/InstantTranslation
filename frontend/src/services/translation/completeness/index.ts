
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
      hasApiKey: !!llmApiKey,
      timestamp: new Date().toISOString()
    });
    
    // 针对中文使用本地规则进行快速检查
    if (languageCode === 'zh' || languageCode === 'zh-CN' || languageCode === 'zh-TW') {
      try {
        console.log('[isInputComplete] 正在调用中文完整性检查API...');
        const startTime = performance.now();
        const response = await request.post('/api/translation/chinese-completeness', { text });
        const endTime = performance.now();
        console.log('[isInputComplete] 中文完整性检查API返回结果:', {
          is_complete: response.is_complete,
          responseTime: `${(endTime - startTime).toFixed(2)}ms`
        });
        return response.is_complete;
      } catch (e) {
        console.error('[isInputComplete] 中文句子完整性检查失败，使用后备方法', e);
        // 后备方法：检查中文句子是否以句号、问号、感叹号结尾
        const isComplete = /[。？！.?!]$/.test(text.trim());
        console.log('[isInputComplete] 使用后备方法检查结果:', { isComplete });
        return isComplete;
      }
    }
    
    // 针对其他语言，使用大模型进行完整性检查
    // 只有当文本长度超过特定值时才调用API
    if (text.length < 5) {
      console.log('[isInputComplete] 文本长度过短，不调用API，直接返回false');
      return false;
    }
    
    // 对于没有API密钥的情况，使用简单规则检测
    if (!llmApiKey) {
      console.log('[isInputComplete] 未提供API密钥，使用简单规则检测');
      let isComplete = false;
      
      // 英语：检查是否以.!?结尾
      if (languageCode.startsWith('en')) {
        isComplete = /[.?!]$/.test(text.trim());
        console.log('[isInputComplete] 英语简单规则检测结果:', { isComplete });
        return isComplete;
      }
      // 日语：检查是否以。？！结尾
      if (languageCode === 'ja') {
        isComplete = /[。？！.?!]$/.test(text.trim());
        console.log('[isInputComplete] 日语简单规则检测结果:', { isComplete });
        return isComplete;
      }
      // 其他语言，假设句号结尾为完整
      isComplete = /[.。？！?!]$/.test(text.trim());
      console.log('[isInputComplete] 其他语言简单规则检测结果:', { isComplete });
      return isComplete;
    }
    
    console.log('[isInputComplete] 准备调用后端完整性检查API...');
    
    // 使用大模型API进行更准确的完整性检查
    try {
      const startTime = performance.now();
      
      const requestPayload = {
        text,
        llm_api_key: llmApiKey,
        llm_provider: llmProvider
      };
      
      console.log('[isInputComplete] 发送请求到 /api/translation/completeness:', {
        textLength: text.length,
        llm_provider: llmProvider,
        hasApiKey: !!llmApiKey
      });
      
      const data = await request.post('/api/translation/completeness', requestPayload);
      
      const endTime = performance.now();
      
      console.log('[isInputComplete] 完整性检查API返回结果:', {
        is_complete: data.is_complete,
        reason: data.reason,
        responseTime: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      // 保存检查结果到window对象便于其他组件使用
      (window as any).__lastCheck = {
        text,
        isComplete: data.is_complete,
        reason: data.reason,
        timestamp: new Date().toISOString()
      };
      
      return data.is_complete;
    } catch (error) {
      console.error('[isInputComplete] 完整性检查API调用失败:', error);
      
      // 使用简单规则作为后备方案
      const isComplete = /[.。？！?!]$/.test(text.trim());
      
      console.log('[isInputComplete] API调用失败，使用后备规则检查结果:', { isComplete });
      
      // 保存检查结果到window对象便于其他组件使用
      (window as any).__lastCheck = {
        text,
        isComplete,
        reason: '使用规则检查（API调用失败）',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
      
      return isComplete;
    }
  } catch (e) {
    console.error('[isInputComplete] 完整性检查过程出错:', e);
    return true; // 出错时默认认为输入完整，避免阻止翻译
  }
}

/**
 * 判断是否应该触发翻译操作
 */
export async function shouldTranslateEx(
  currentText: string,
  languageCode: string,
  lastTranslatedText: string,
  isFirstTranslation: boolean,
  llmApiKey: string,
  llmProvider: string
): Promise<any> {
  console.log('[shouldTranslateEx] 检查是否应该翻译:', { 
    当前文本长度: currentText?.length || 0,
    语言代码: languageCode,
    lastTranslatedText长度: lastTranslatedText?.length || 0,
    是否首次翻译: isFirstTranslation,
    LLM提供商: llmProvider,
    是否有API密钥: !!llmApiKey
  });
  
  // 处理空白文本
  if (!currentText?.trim()) {
    console.log('[shouldTranslateEx] 空白文本，不翻译');
    return {
      shouldTranslate: false,
      isComplete: false,
      reason: '输入为空'
    };
  }
  
  // 文本没有变化
  if (currentText === lastTranslatedText) {
    console.log('[shouldTranslateEx] 文本未变化，不翻译');
    return {
      shouldTranslate: false,
      isComplete: false,
      reason: '文本未变化'
    };
  }
  
  // 检查文本是否完整
  const startTime = performance.now();
  const isComplete = await isInputComplete(currentText, languageCode, llmApiKey, llmProvider);
  const endTime = performance.now();
  
  console.log('[shouldTranslateEx] 完整性检查结果:', { 
    isComplete, 
    检查耗时: `${(endTime - startTime).toFixed(2)}ms`
  });
  
  // 首次翻译且文本完整，直接触发翻译
  if (isFirstTranslation && isComplete) {
    console.log('[shouldTranslateEx] 首次翻译且文本完整，触发翻译');
    return {
      shouldTranslate: true,
      isComplete: true,
      reason: '首次翻译且文本完整'
    };
  }
  
  // 文本完整则触发翻译
  if (isComplete) {
    console.log('[shouldTranslateEx] 文本完整，触发翻译');
    return {
      shouldTranslate: true,
      isComplete: true,
      reason: '文本完整'
    };
  }
  
  console.log('[shouldTranslateEx] 文本不完整，不触发翻译');
  return {
    shouldTranslate: false,
    isComplete: false,
    reason: '文本不完整'
  };
}
