
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SplashScreen = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 确保在启动页面加载完成后再隐藏系统启动画面
    const hideSplashScreen = async () => {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (error) {
        console.log('Hide splash screen error:', error);
      }
    };
    
    hideSplashScreen();
    
    // 3秒后自动导航到主页
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-sky-100 dark:from-gray-900 dark:to-gray-800">
      <div className={cn(
        "flex flex-col items-center justify-center",
        "animate-pulse duration-1000"
      )}>
        <div className="text-5xl font-bold mb-4 text-primary">即时翻译</div>
        <div className="text-xl text-gray-600 dark:text-gray-300">快速翻译任何语言的文本</div>
      </div>
    </div>
  );
};

export default SplashScreen;
