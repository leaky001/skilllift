import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Explicitly define environment variables
      'import.meta.env.VITE_STREAM_API_KEY': JSON.stringify(env.VITE_STREAM_API_KEY),
      'import.meta.env.VITE_STREAM_API_SECRET': JSON.stringify(env.VITE_STREAM_API_SECRET),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    server: {
      port: 5173,
      host: true
    }
  }
})
