import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    http: true, // Enable HTTPS
    host: 'localhost',
    port: 5173,
  },
  
  
})