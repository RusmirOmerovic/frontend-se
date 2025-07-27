import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: '.', // jetzt im Root-Verzeichnis
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [react()]
})

