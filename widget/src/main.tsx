import React from 'react'
import ReactDOM from 'react-dom/client'
import DinoGame from './DinoGame'
import './styles.css'

declare global {
  interface Window {
    openai?: {
      toolInput?: Record<string, unknown>
      toolOutput?: Record<string, unknown>
      widgetState?: Record<string, unknown>
      setWidgetState?: (state: Record<string, unknown>) => void
      callTool?: (name: string, args: Record<string, unknown>) => Promise<unknown>
      theme?: 'light' | 'dark'
    }
  }
}

ReactDOM.createRoot(document.getElementById('dino-root')!).render(
  <React.StrictMode>
    <DinoGame />
  </React.StrictMode>
)
