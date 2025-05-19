
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
    // 添加额外的Android特定配置
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#FFFFFF"
    }
  }
};

export default config;
