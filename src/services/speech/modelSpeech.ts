
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
    // 这里只是占位符，实际实现将在useSpeechFeatures中处理
    return () => {};
  }

  // 创建mediaRecorder以采集音频
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    let isRecording = true;

    // 处理音频数据
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // 当录音停止时，发送到OpenAI API
    mediaRecorder.onstop = async () => {
      if (!isRecording) {
        return;
      }
      
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // 创建表单数据
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', getModelName(model));
        
        if (language) {
          formData.append('language', language);
        }
        
        console.log(`使用${model}模型进行语音识别`);
        
        // 发送到OpenAI API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });
        
        if (!response.ok) {
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
        onEnd();
      }
    };

    // 开始录音
    mediaRecorder.start();
    console.log('开始使用模型录音');
    
    // 每10秒发送一次请求（可配置）
    const intervalId = setInterval(() => {
      if (isRecording) {
        mediaRecorder.stop();
        mediaRecorder.start();
      }
    }, 10000);

    // 返回停止函数
    return () => {
      isRecording = false;
      clearInterval(intervalId);
      mediaRecorder.stop();
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
      return "gpt-4o";
    case "gpt4omini":
      return "gpt-4o-mini";
    default:
      return "whisper-1";
  }
};
