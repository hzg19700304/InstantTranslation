
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 确保在DOM加载完成后进行渲染
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error("Root element not found");
    // 尝试创建root元素
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    createRoot(newRoot).render(<App />);
  }
});
