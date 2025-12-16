import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || process.env.API_KEY || '')
    },
    resolve: {
      // CRITICAL FIX: Forces Vite to look for 'node' exports if browser is missing
      // This solves the [commonjs--resolver] error for @google/genai
      conditions: ['node', 'import', 'module', 'browser', 'default']
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    server: {
      port: 3000,
      host: true
    }
  };
});