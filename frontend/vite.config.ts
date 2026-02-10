import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '127.0.0.1',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@/types': path.resolve(__dirname, './src/types/index.ts'),
          '@/constants': path.resolve(__dirname, './src/constants/index.ts'),
          '@/hooks': path.resolve(__dirname, './src/hooks'),
          '@/components/common': path.resolve(__dirname, './src/components/common'),
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
