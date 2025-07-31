import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.', // jetzt im Root-Verzeichnis
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [react()]
})

