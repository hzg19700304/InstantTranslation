import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { LLMSettingsProvider } from "@/hooks/translation/useLLMSettings";

// 确保在DOM加载完成后进行渲染
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <LLMSettingsProvider>
          <App />
        </LLMSettingsProvider>
      </React.StrictMode>
    );
  } else {
    console.error("Root element not found");
    // 尝试创建root元素
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    ReactDOM.createRoot(newRoot).render(
      <React.StrictMode>
        <LLMSettingsProvider>
          <App />
        </LLMSettingsProvider>
      </React.StrictMode>
    );
  }
});
