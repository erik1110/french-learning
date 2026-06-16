import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes all asset paths relative, so the built site works both at a
// domain root and under a sub-path (e.g. GitHub Pages: /<repo>/) without config.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
  },
})
