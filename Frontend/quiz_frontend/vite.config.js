import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://quiz-api-eqba.onrender.com' // Proxy API calls to backend
    }
  }
});