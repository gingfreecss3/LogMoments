import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from './queryClient.ts'
import { initializeMobileApp, isNativeMobile } from './mobile'

if (!isNativeMobile()) {
  registerSW({ immediate: true })
}

initializeMobileApp()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
