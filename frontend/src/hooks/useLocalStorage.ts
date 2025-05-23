import { useState, useEffect } from 'react';

/**
 * @AI-Generated
 * 支持字符串和对象类型的 localStorage Hook
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 创建state以存储值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      try {
        // 优先尝试 JSON.parse
        return JSON.parse(item);
      } catch {
        // 如果不是 JSON（如纯字符串），直接返回
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回一个被包装的版本setState，将新值同步到localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        // 如果是字符串，直接存；否则存 JSON
        if (typeof valueToStore === 'string') {
          window.localStorage.setItem(key, valueToStore);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听localStorage变化（例如在其他选项卡中）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch {
            setStoredValue(e.newValue as unknown as T);
          }
        } catch (error) {
          console.warn(`Error parsing localStorage value:`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}
