import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@services': path.resolve(__dirname, './src/features/cuadrillas/services/'),
      '@hooks': path.resolve(__dirname, './src/features/cuadrillas/hooks/'),
      '@components': path.resolve(__dirname, './src/features/cuadrillas/components/'),
    },
  },
})
