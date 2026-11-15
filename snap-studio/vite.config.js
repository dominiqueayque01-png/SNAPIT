
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/SNAPIT/',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    strictPort: false
  }
})
