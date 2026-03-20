import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 리포지토리 이름을 base 경로로 설정해야 합니다.
  base: '/traveling-app/', 
})