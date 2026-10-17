import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [react()],
    server: { port: 5173, open: false },
    define: {
      'globalThis.process.env.DEEPSEEK_API_KEY': JSON.stringify(
        env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || '',
      ),
      'globalThis.process.env.GEMINI_API_KEY': JSON.stringify(
        env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '',
      ),
      'globalThis.process.env.API_KEY': JSON.stringify(
        env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || env.API_KEY || env.GEMINI_API_KEY || '',
      ),
    },
  };
});
