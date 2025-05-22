import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import { useMobilePlatform } from "./hooks/use-mobile-platform";
import { useEffect, useState } from "react";
import { useVoiceInput } from "./hooks/speech/useVoiceInput";
import { SpeechModel } from "@/components/speech/VoiceModelSelector";

// 创建查询客户端实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguageCode, setSourceLanguageCode] = useState('zh'); // 默认中文，可根据需要修改
  const [sourceLanguageName, setSourceLanguageName] = useState('Chinese'); // 默认中文，可根据需要修改
  const [currentSpeechModel, setCurrentSpeechModel] = useState<SpeechModel>('webspeech'); // 类型修正
  const [speechApiKey, setSpeechApiKey] = useState(''); // 这里不要硬编码真实key
  const { isNative } = useMobilePlatform();
  const { resetVoiceInputRefs } = useVoiceInput({
    sourceText,
    setSourceText,
    sourceLanguageCode,
    sourceLanguageName,
    currentSpeechModel,
    speechApiKey
  });
  
  // 为移动设备添加后退按钮处理
  useEffect(() => {
    if (isNative) {
      // 使用动态导入而不是静态导入，以避免在网页环境中出错
      const setupBackButton = async () => {
        try {
          const { App: CapacitorApp } = await import('@capacitor/app');
          const backButtonHandlerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapacitorApp.exitApp();
            } else {
              window.history.back();
            }
          });
          
          // 先解析promise获取实际的handler，然后再返回cleanup函数
          return async () => {
            const backButtonHandler = await backButtonHandlerPromise;
            backButtonHandler.remove();
          };
        } catch (err) {
          console.error('Failed to load Capacitor App:', err);
          return () => {};
        }
      };
      
      // 执行设置并存储cleanup函数
      const cleanupPromise = setupBackButton();
      return () => {
        // 确保在组件卸载时执行清理函数
        cleanupPromise.then(cleanupFn => cleanupFn());
      };
    }
  }, [isNative]);

  const handleClearTranslation = () => {
    setSourceText('');
    resetVoiceInputRefs();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* 在移动应用环境下，显示启动页面 */}
            {isNative && <Route path="/splash" element={<SplashScreen />} />}
            
            {/* 主路由 - 对移动和网页都通用 */}
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Index />} />
            
            {/* 捕获所有其他路由 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
