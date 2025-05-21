
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

// 使用OpenAI API进行语音识别
export const startModelVoiceInput = async (
  model: SpeechModel,
  apiKey: string,
  language: string,
  onResult: (text: string, isFinal: boolean) => void,
  onEnd: () => void
): Promise<() => void> => {
  // 如果选择的是Web Speech API，则直接使用现有的startVoiceInput函数
  if (model === "webspeech") {
    // 在实际实现中，这将通过导入的startVoiceInput函数处理
    return () => {};
  }

  if (!apiKey) {
    console.error("未提供API密钥，无法使用模型语音识别");
    throw new Error("缺少API密钥");
  }

  // 创建mediaRecorder以采集音频
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    let isRecording = true;

    // 处理音频数据
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && isRecording) {
        audioChunks.push(event.data);
      }
    };

    // 当录音停止时，发送到OpenAI API
    mediaRecorder.onstop = async () => {
      if (!isRecording) {
        return;
      }
      
      if (audioChunks.length === 0) {
        console.log("没有收集到音频数据");
        // 重新开始录音
        if (isRecording) {
          try {
            mediaRecorder.start();
            console.log("重新开始录音");
          } catch (error) {
            console.error("重新开始录音失败:", error);
          }
        }
        return;
      }
      
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (audioBlob.size < 100) {
          console.log("音频数据太小，可能没有收集到有效的录音");
          audioChunks.length = 0;
          
          // 重新开始录音
          if (isRecording) {
            try {
              mediaRecorder.start();
              console.log("音频数据太小，重新开始录音");
            } catch (error) {
              console.error("重新开始录音失败:", error);
            }
          }
          return;
        }
        
        // 创建表单数据
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', getModelName(model));
        
        if (language) {
          formData.append('language', language);
        }
        
        console.log(`使用${model}模型进行语音识别，音频大小: ${(audioBlob.size / 1024).toFixed(2)}KB`);
        
        // 根据模型选择正确的API端点
        const endpoint = 'https://api.openai.com/v1/audio/transcriptions';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error(`OpenAI API错误: ${response.status}`);
          console.error(`响应内容:`, responseText);
          throw new Error(`API错误: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('语音识别结果:', result);
        
        // 返回结果
        if (result.text) {
          onResult(result.text, true);
        }
      } catch (error) {
        console.error('语音识别API错误:', error);
      } finally {
        // 在完成处理后清空音频块
        audioChunks.length = 0;
        
        // 如果仍在录音状态，继续录音
        if (isRecording) {
          try {
            mediaRecorder.start();
            console.log("继续录音");
          } catch (error) {
            console.error("继续录音失败:", error);
            onEnd();
          }
        }
      }
    };

    // 开始录音
    mediaRecorder.start();
    console.log('开始使用模型录音');
    
    // 每5秒发送一次请求
    const intervalId = setInterval(() => {
      if (isRecording && mediaRecorder.state === "recording") {
        try {
          mediaRecorder.stop();
        } catch (error) {
          console.error("停止录音时出错:", error);
        }
      }
    }, 5000);

    // 添加媒体记录器的错误处理
    mediaRecorder.onerror = (event) => {
      console.error('媒体记录器错误:', event);
      isRecording = false;
      clearInterval(intervalId);
      if (mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch (e) {
          console.error('停止媒体记录器时出错:', e);
        }
      }
      stream.getTracks().forEach(track => track.stop());
      onEnd();
    };

    // 返回停止函数
    return () => {
      isRecording = false;
      clearInterval(intervalId);
      if (mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch (e) {
          console.error('停止媒体记录器时出错:', e);
        }
      }
      stream.getTracks().forEach(track => track.stop());
      onEnd();
    };
  } catch (error) {
    console.error('语音录制错误:', error);
    onEnd();
    return () => {};
  }
};

// 获取对应的OpenAI模型名称
const getModelName = (model: SpeechModel): string => {
  switch (model) {
    case "whisper":
      return "whisper-1";
    case "gpt4o":
      return "whisper-1"; // OpenAI的transcriptions API实际上用的是whisper
    case "gpt4omini":
      return "whisper-1"; // 同上，目前OpenAI只提供whisper-1
    default:
      return "whisper-1";
  }
};
