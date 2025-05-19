
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import { useMobilePlatform } from "./hooks/use-mobile-platform";

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
  const { isNative } = useMobilePlatform();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* 在移动应用环境下，显示启动页面 */}
            {isNative && <Route path="/splash" element={<SplashScreen />} />}
            {/* 在移动应用环境下，默认路由到启动页面 */}
            {isNative && <Route path="/" element={<Navigate to="/splash" replace />} />}
            {/* 常规路由 */}
            {!isNative && <Route path="/" element={<Index />} />}
            {/* 启动页面完成后会路由到主页 */}
            <Route path="/home" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
