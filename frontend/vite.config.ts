import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // 모든 IP에서 접근 가능
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 백엔드 포트를 8000으로 수정
        changeOrigin: true,
      },
    },
  },
}) 