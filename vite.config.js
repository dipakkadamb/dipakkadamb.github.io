import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For dipakkadamb.github.io (USER site), base MUST be '/'
// Repo must be named exactly: dipakkadamb.github.io
export default defineConfig({
  plugins: [react()],
  base: '/',
})
