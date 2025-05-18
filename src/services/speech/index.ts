
// 语音服务工具 - 移动应用兼容版本

// 检测设备环境
const isMobileApp = (): boolean => {
  // 检查是否在Capacitor环境中
  return typeof window !== 'undefined' && 
    !!(window as any).Capacitor;
};

// 检查语音API可用性
const checkSpeechSupport = (): { recognition: boolean, synthesis: boolean } => {
  const hasRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasSynthesis = !!(window.speechSynthesis);
  
  return {
    recognition: hasRecognition,
    synthesis: hasSynthesis
  };
};

// 语音输入 - Web Speech API (移动优化版)
export const startVoiceInput = (
  language: string,
  onResult: (text: string, isFinal: boolean) => void,
  onEnd: () => void
): (() => void) => {
  const support = checkSpeechSupport();
  
  if (!support.recognition) {
    console.error("当前设备或浏览器不支持语音识别");
    // 通知调用者语音识别不可用
    setTimeout(() => onEnd(), 0);
    return () => {};
  }

  // 使用浏览器原生语音识别API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // 为移动设备优化的设置
  recognition.continuous = true; 
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1; // 减少计算负担

  let interimTranscript = '';
  let isRestarting = false;
  let restartAttempts = 0;
  const MAX_RESTART_ATTEMPTS = 3;

  // 识别结果处理
  recognition.onresult = (event) => {
    interimTranscript = '';
    
    // 遍历所有识别结果
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        // 返回最终结果
        onResult(transcript.trim(), true);
        console.log("语音识别最终结果:", transcript.trim());
        // 重置重启计数
        restartAttempts = 0;
      } else {
        interimTranscript += transcript;
        // 返回临时结果
        onResult(interimTranscript.trim(), false);
      }
    }
  };

  recognition.onend = () => {
    // 在移动设备上，可能会因为系统限制而意外终止
    // 仅当明确需要持续模式且未达到最大重试次数时重启
    if (recognition.continuous && !isRestarting && restartAttempts < MAX_RESTART_ATTEMPTS) {
      restartAttempts++;
      console.log(`语音识别结束，尝试重启 (${restartAttempts}/${MAX_RESTART_ATTEMPTS})`);
      
      // 添加更长的延迟，减少移动设备上的资源占用
      setTimeout(() => {
        try {
          // 在移动设备上，可能需要重新请求录音权限
          if (isMobileApp()) {
            // TODO: 使用Capacitor插件请求权限
            // 这需要添加Capacitor的麦克风插件
          }
          
          recognition.start();
          console.log("语音识别服务自动重启");
        } catch (error) {
          console.error("重启语音识别失败:", error);
          onEnd();
        }
      }, 800); // 移动设备上使用更长的延迟
    } else {
      // 达到最大重试次数或明确停止
      onEnd();
    }
  };

  recognition.onerror = (event) => {
    console.error("语音识别错误:", event.error);
    
    // 移动设备上的特定错误处理
    if (event.error === 'network' || event.error === 'service-not-allowed') {
      isRestarting = true;
      setTimeout(() => {
        try {
          recognition.abort();
          recognition.start();
          isRestarting = false;
          console.log("语音识别服务因错误重启");
        } catch (error) {
          console.error("重启语音识别失败:", error);
          onEnd();
        }
      }, 1500); // 网络错误使用更长的延迟
    } else if (event.error === 'no-speech') {
      // 无语音输入，不视为错误，继续监听
      console.log("未检测到语音输入，继续监听...");
    } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      // 权限问题，提示用户
      console.error("语音识别需要麦克风权限");
      onEnd();
    } else {
      // 其他错误，可能需要停止服务
      onEnd();
    }
  };

  // 开始识别
  try {
    recognition.start();
    console.log("语音识别服务启动");
  } catch (error) {
    console.error("启动语音识别失败:", error);
    onEnd();
    return () => {};
  }

  // 返回停止函数
  return () => {
    try {
      isRestarting = true; // 标记为手动停止，防止自动重启
      recognition.stop();
      console.log("语音识别服务已停止");
    } catch (error) {
      console.error("停止语音识别失败:", error);
    }
  };
};

// 文本朗读 - Web Speech API (移动优化版)
export const speakText = (text: string, language: string): (() => void) => {
  const support = checkSpeechSupport();
  
  if (!support.synthesis) {
    console.error("当前设备或浏览器不支持语音合成");
    return () => {};
  }

  // 停止任何正在进行的语音
  window.speechSynthesis.cancel();

  // 创建语音合成实例
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 1.0; // 正常语速
  utterance.pitch = 1.0; // 正常音调
  
  // 移动设备上可能需要处理较长文本
  // 将长文本分割成小段以避免在某些移动设备上的限制
  if (text.length > 200) {
    const chunks = splitTextIntoChunks(text, 200);
    let currentChunk = 0;
    
    // 处理一个段落结束后的事件
    utterance.onend = () => {
      currentChunk++;
      if (currentChunk < chunks.length) {
        const nextUtterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
        nextUtterance.lang = language;
        nextUtterance.onend = utterance.onend;
        window.speechSynthesis.speak(nextUtterance);
      }
    };
    
    // 开始朗读第一个段落
    utterance.text = chunks[0];
  }

  // 移动设备上防止语音服务被暂停
  let resumeTimer: number | null = null;
  
  if (isMobileApp()) {
    // 每3秒检查一次，如果暂停了就恢复
    resumeTimer = window.setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 3000);
  }

  // 开始朗读
  window.speechSynthesis.speak(utterance);

  // 返回停止函数
  return () => {
    window.speechSynthesis.cancel();
    if (resumeTimer !== null) {
      clearInterval(resumeTimer);
    }
  };
};

// 辅助函数：将文本分割成小段
const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  
  // 尝试在句子结束处分割
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // 如果单个句子超过maxLength，需要进一步分割
      if (sentence.length > maxLength) {
        // 按词分割
        const words = sentence.split(' ');
        currentChunk = '';
        
        for (const word of words) {
          if ((currentChunk + ' ' + word).length <= maxLength) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            currentChunk = word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};
