
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.instanttranslation',
  appName: 'instant-translation',
  webDir: 'dist',
  server: {
    url: "https://4ecdefce-e679-4f52-95f8-34e52426df93.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined,
      releaseType: undefined,
    },
    // Android特定配置
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // 添加以下配置以确保应用在真实设备上良好运行
    backgroundColor: "#FFFFFF",
    initialMargin: 0, // 移除边距
    useLegacyBridge: false, // 使用新的桥接方式提高性能
    hiddenTitle: true, // 隐藏顶部原生标题栏
    fullScreen: true, // 全屏显示
    loggingBehavior: "debug" // 启用调试日志便于排查问题
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#FFFFFF"
    }
  }
};

export default config;
