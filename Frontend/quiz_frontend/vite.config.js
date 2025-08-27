import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://quiz-application-4ati.onrender.com/api' // Proxy API calls to backend
    }
  }
});