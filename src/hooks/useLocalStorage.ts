
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 创建state以存储值
  // 使用函数初始化避免存储在每次渲染时重新执行
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回一个被包装的版本setState，将新值同步到localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许value是函数，像useState的setter
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到state
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听localStorage变化（例如在其他选项卡中）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== JSON.stringify(storedValue)) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value:`, error);
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, storedValue, initialValue]);

  return [storedValue, setValue];
}
