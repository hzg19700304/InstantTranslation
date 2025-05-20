
// 移动应用环境类型定义

// Capacitor全局对象类型
interface CapacitorGlobal {
  Plugins?: {
    [pluginName: string]: any;
  };
  isNativePlatform?: () => boolean;
  getPlatform?: () => 'ios' | 'android' | 'web';
}

// 扩展Window类型
interface Window {
  Capacitor?: CapacitorGlobal;
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  speechSynthesis?: SpeechSynthesis;
}

// 重新声明WebSpeechAPI的类型，以更好地支持移动环境中的错误处理
interface SpeechRecognitionError extends Event {
  error: 'aborted' | 'audio-capture' | 'bad-grammar' | 'language-not-supported' | 'network' | 'no-speech' | 'not-allowed' | 'service-not-allowed' | 'permission-denied' | string;
  message: string;
}
