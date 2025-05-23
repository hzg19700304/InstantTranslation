
// Utility functions for translation services

// Language code mappings for different services
export const getHFLanguageCode = (code: string): string | null => {
  const mapping: Record<string, string> = {
    "en": "en_XX",
    "zh": "zh_CN",
    "fr": "fr_XX",
    "de": "de_DE",
    "es": "es_XX",
    "it": "it_IT",
    "ja": "ja_XX",
    "ko": "ko_KR",
    "ru": "ru_RU",
    "pt": "pt_XX",
    "ar": "ar_AR"
    // 其他语言可以按需添加
  };
  
  return mapping[code] || null;
};

// Get full language name from code
export const getLanguageName = (code: string): string => {
  const mapping: Record<string, string> = {
    "en": "英语",
    "zh": "中文",
    "fr": "法语",
    "de": "德语",
    "es": "西班牙语",
    "it": "意大利语",
    "ja": "日语",
    "ko": "韩语",
    "ru": "俄语",
    "pt": "葡萄牙语",
    "ar": "阿拉伯语",
    "nl": "荷兰语",
    "pl": "波兰语",
    "tr": "土耳其语"
    // 可以按需添加更多语言
  };
  
  return mapping[code] || code;
};

// A basic fallback translation dictionary
export const getFallbackTranslation = (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): string | null => {
  // 修正的字典结构，确保类型正确
  const dictionary: Record<string, Record<string, Record<string, string>>> = {
    "en": {
      "hello": { "zh": "你好" },
      "thank": { "zh": "谢谢" },
      "world": { "zh": "世界" },
      "translate": { "zh": "翻译" },
      "language": { "zh": "语言" },
      "error": { "zh": "错误" },
      "failed": { "zh": "失败" },
      "try": { "zh": "尝试" },
      "again": { "zh": "再次" }
    },
    "zh": {
      "你好": { "en": "hello" },
      "谢谢": { "en": "thank you" },
      "世界": { "en": "world" },
      "翻译": { "en": "translate" },
      "语言": { "en": "language" },
      "错误": { "en": "error" },
      "失败": { "en": "failed" },
      "尝试": { "en": "try" },
      "再次": { "en": "again" }
    }
  };
  
  // 检查字典中是否有匹配的词
  if (dictionary[sourceLanguage]) {
    for (const [key, translations] of Object.entries(dictionary[sourceLanguage])) {
      if (text.toLowerCase().includes(key.toLowerCase()) && 
          translations[targetLanguage]) {
        return `[离线翻译] ${translations[targetLanguage]}`;
      }
    }
  }
  
  return null;
};
