
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
  recognition.continuous = true; // 设置为持续识别模式
  recognition.interimResults = true; // 启用临时结果，获取实时反馈
  recognition.lang = language; // 设置为传入的语言代码

  let finalTranscript = '';

  // 识别结果处理
  recognition.onresult = (event) => {
    let interimTranscript = '';
    
    // 遍历所有识别结果
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
        onResult(finalTranscript.trim());
      } else {
        interimTranscript += transcript;
      }
    }
  };

  recognition.onend = () => {
    // 在持续模式下，如果识别停止（例如由于暂停），自动重新开始
    // 除非通过返回的停止函数明确停止
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
