import { SpeechModel } from "@/components/speech/VoiceModelSelector";
import * as vad from '@ricky0123/vad-web';
import ort from 'onnxruntime-web';

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
    
    // 新增：暴露一个清空缓存的函数
    const resetAudioChunks = () => {
      audioChunks.length = 0;
    };
    
    let isRecording = true;

    // ========== Silero VAD 实时人声检测集成 ========== //
    /**
     * @AI-Generated
     * @description 初始化 Silero VAD，实时检测人声，仅收集有人声的音频块
     */
    let micVad: vad.MicVAD | null = null;
    let vadReady = false;
    let vadSpeechActive = false;
    let vadAudioChunks: Blob[] = [];
    try {
      micVad = await vad.MicVAD.new({
        positiveSpeechThreshold: 0.5, // 可根据实际调整
        negativeSpeechThreshold: 0.2,
        redemptionFrames: 10,
        preSpeechPadFrames: 5,
        onSpeechStart: () => {
          vadSpeechActive = true;
          vadAudioChunks = [];
        },
        onSpeechEnd: (audio) => {
          vadSpeechActive = false;
          // audio: Float32Array, 16000Hz, 单通道
          // 这里可选：将 audio 转为 Blob 并推入 vadAudioChunks
        },
        onVADMisfire: () => {
          // 可选：处理误触发
        },
      });
      vadReady = true;
    } catch (e) {
      console.error('Silero VAD 初始化失败，降级为静音检测:', e);
      vadReady = false;
    }

    // 处理音频数据
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && isRecording) {
        // ========== VAD 检测 ========== //
        if (vadReady && micVad) {
          // 将 Blob 转为 ArrayBuffer，再转为 Float32Array
          const arrayBuffer = await event.data.arrayBuffer();
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const float32 = audioBuffer.getChannelData(0); // 只取第一个通道
          audioCtx.close();
          // Silero VAD MicVAD 不支持手动输入 PCM，仅支持自动采集麦克风流。此处暂不做处理。
        } else {
          // 未启用 VAD，回退原有逻辑
          audioChunks.push(event.data);
        }
      }
    };

    // 静音检测函数，增加最短时长判断
    async function isSilentOrTooShortAudio(audioBlob: Blob, silenceThreshold = 0.005, minDuration = 0.5): Promise<boolean> {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      const audioContext = new AudioCtx();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 最短时长判断
      if (audioBuffer.duration < minDuration) {
        audioContext.close();
        return true;
      }

      let sum = 0;
      let count = 0;
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 0; j < data.length; j++) {
          sum += Math.abs(data[j]);
          count++;
        }
      }
      const avg = sum / count;
      audioContext.close();
      return avg < silenceThreshold;
    }

    // 当录音停止时，发送到OpenAI API
    mediaRecorder.onstop = async () => {
      if (!isRecording) {
        return;
      }
      // ========== VAD 过滤后上传 ========== //
      let uploadChunks: Blob[] = vadReady ? vadAudioChunks : audioChunks;
      if (uploadChunks.length === 0) {
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
        const audioBlob = new Blob(uploadChunks, { type: 'audio/webm' });
        if (audioBlob.size < 100) {
          console.log("音频数据太小，可能没有收集到有效的录音");
          uploadChunks.length = 0;
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
        // 保留原有静音检测
        const isSilentOrTooShort = await isSilentOrTooShortAudio(audioBlob, 0.005, 0.5);
        if (isSilentOrTooShort) {
          console.log("检测到静音或音频过短，跳过识别。");
          uploadChunks.length = 0;
          if (isRecording) {
            try {
              mediaRecorder.start();
              console.log("静音或过短，重新开始录音");
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
        // 添加优化后的 prompt，减少模型脑补
        formData.append('prompt',
          'You are a speech-to-text engine. Transcribe the following audio content as accurately as possible. Only output the exact words spoken in the audio, do not add, complete, or expand the content. If the audio is empty or meaningless, return an empty string. Do not output any explanation, formatting, or additional information. Transcribe in the original language of the audio.'
        );
        
        console.log(`使用${model}模型进行语音识别，音频大小: ${(audioBlob.size / 1024).toFixed(2)}KB`);
        
        // 根据模型选择正确的API端点
        const endpoint = '/api/translation/speech-to-text';
        
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
        uploadChunks.length = 0;
        
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

    // 开始录音前，清空缓存
    resetAudioChunks();
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
      // 停止时也清空缓存
      resetAudioChunks();
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

// 导出清空缓存函数，供外部调用
export const clearModelVoiceCache = () => {
  // 这里实际项目中应有全局缓存管理，这里仅做示例
  // 如果有全局 audioChunks，可以在这里清空
};
