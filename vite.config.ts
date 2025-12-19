import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve 'cwd' property error in Vite environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    build: {
      rollupOptions: {
        // Ensure libraries imported via ESM in the app are handled
        external: [],
      }
    },
    optimizeDeps: {
      include: ['xlsx', 'html2canvas', 'lucide-react', 'react', 'react-dom']
    }
  };
});
