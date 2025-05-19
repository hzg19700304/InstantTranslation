
import * as React from "react";
import { useIsMobile } from "./use-mobile";

/**
 * 检测应用当前运行的平台
 * @returns 返回包含平台信息的对象
 */
export function useMobilePlatform() {
  const isMobile = useIsMobile();
  const [platform, setPlatform] = React.useState<'ios' | 'android' | 'web'>('web');
  const [isNative, setIsNative] = React.useState<boolean>(false);

  React.useEffect(() => {
    // 检查是否在Capacitor环境中运行
    const checkPlatform = () => {
      if (typeof window !== 'undefined' && window.Capacitor) {
        setIsNative(!!window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        
        if (window.Capacitor.getPlatform) {
          const nativePlatform = window.Capacitor.getPlatform();
          setPlatform(nativePlatform as 'ios' | 'android' | 'web');
        }
      }
    };

    // 添加错误处理以防止在静态部署时的问题
    try {
      checkPlatform();
    } catch (err) {
      console.log('Platform detection error:', err);
      setPlatform('web');
      setIsNative(false);
    }
  }, []);

  return {
    isMobile, // 是否是移动设备（基于屏幕尺寸）
    platform, // 当前平台：'ios', 'android', 或 'web'
    isNative, // 是否在原生环境中运行
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
}
