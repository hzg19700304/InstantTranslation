
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
    // 添加以下配置以确保应用全屏显示，适应小屏幕
    backgroundColor: "#FFFFFF",
    initialMargin: 0, // 移除边距
    useLegacyBridge: false // 使用新的桥接方式提高性能
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#FFFFFF"
    }
  }
};

export default config;
