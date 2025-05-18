
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
    // 在持续模式下，自动重启识别服务，除非明确停止
    // 添加一个短暂延迟，避免立即重启可能导致的问题
    if (recognition.continuous) {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.error("重启语音识别失败:", error);
        }
      }, 200);
    }
    onEnd();
  };

  recognition.onerror = (event) => {
    console.error("语音识别错误:", event.error);
    // 如果是网络错误，尝试自动重启
    if (event.error === 'network' || event.error === 'service-not-allowed') {
      setTimeout(() => {
        try {
          recognition.abort();
          recognition.start();
        } catch (error) {
          console.error("重启语音识别失败:", error);
        }
      }, 1000);
    }
    onEnd();
  };

  // 开始识别
  try {
    recognition.start();
  } catch (error) {
    console.error("启动语音识别失败:", error);
    return () => {};
  }

  // 返回停止函数
  return () => {
    try {
      recognition.stop();
    } catch (error) {
      console.error("停止语音识别失败:", error);
    }
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
