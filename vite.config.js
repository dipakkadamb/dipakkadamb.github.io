import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'dipak-kadam-portfolio' with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/dipak-kadam-portfolio/',  // ← must match your GitHub repo name
})
