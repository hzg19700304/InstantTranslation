
// 语音服务工具

// 语音输入 - Web Speech API
export const startVoiceInput = (
  language: string,
  onResult: (text: string) => void,
  onEnd: () => void
): (() => void) => {
  if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
    console.error("您的浏览器不支持语音识别");
    return () => {};
  }

  // 使用浏览器原生语音识别API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // 设置识别参数
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language; // 设置为传入的语言代码

  // 识别结果处理
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event) => {
    console.error("语音识别错误:", event.error);
    onEnd();
  };

  // 开始识别
  recognition.start();

  // 返回停止函数
  return () => {
    recognition.stop();
  };
};

// 文本朗读 - Web Speech API
export const speakText = (text: string, language: string): (() => void) => {
  if (!window.speechSynthesis) {
    console.error("您的浏览器不支持语音合成");
    return () => {};
  }

  // 停止任何正在进行的语音
  window.speechSynthesis.cancel();

  // 创建语音合成实例
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 1.0; // 正常语速
  utterance.pitch = 1.0; // 正常音调

  // 开始朗读
  window.speechSynthesis.speak(utterance);

  // 返回停止函数
  return () => {
    window.speechSynthesis.cancel();
  };
};
