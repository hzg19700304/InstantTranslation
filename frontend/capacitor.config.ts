
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.instanttranslation',
  appName: '即时翻译',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'lovable',
    // 移除URL配置，让应用使用本地文件而不是远程URL
    // url: "https://4ecdefce-e679-4f52-95f8-34e52426df93.lovableproject.com?forceHideBadge=true",
  },
  android: {
    // Android特定配置
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#FFFFFF",
    initialMargin: 0,
    useLegacyBridge: false,
    hiddenTitle: true,
    fullScreen: true,
    loggingBehavior: "debug"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#2563EB",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
