import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 47114, strictPort: true },
  preview: { port: 47114, strictPort: true },
  // appli locale : le contenu (cours, katas…) est volontairement embarqué
  build: { chunkSizeWarningLimit: 2000 },
})
