
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.instanttranslation',
  appName: 'instant-translation',
  webDir: 'dist',
  server: {
    url: "https://4ecdefce-e679-4f52-95f8-34e52426df93.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    // 可以在这里配置插件
  }
};

export default config;
