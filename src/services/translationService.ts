
// 模拟翻译服务
// 实际项目中，你可以将此替换为真实的翻译API调用

export const translateText = async (
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<string> => {
  if (!text) return "";
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 这里只是一个简单的模拟
  // 在实际应用中，你需要调用真实的翻译API
  
  if (sourceLanguage === targetLanguage) return text;
  
  // 简单的模拟翻译
  // 英文 => 中文
  if (sourceLanguage === "en" && targetLanguage === "zh") {
    if (text.toLowerCase().includes("hello")) return "你好";
    if (text.toLowerCase().includes("thank")) return "谢谢";
    if (text.toLowerCase().includes("good")) return "很好";
    return `[中文翻译: ${text}]`;
  }
  
  // 中文 => 英文
  if (sourceLanguage === "zh" && targetLanguage === "en") {
    if (text.includes("你好")) return "Hello";
    if (text.includes("谢谢")) return "Thank you";
    if (text.includes("很好")) return "Very good";
    return `[English translation: ${text}]`;
  }
  
  // 其他语言组合
  return `[${targetLanguage} translation of: ${text}]`;
};
