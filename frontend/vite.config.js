import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port:5174
  }
})














// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react({
//       jsxRuntime: 'automatic',
//     }),
//     tailwindcss(),
//   ],
//   esbuild: {
//     // Suppress non-boolean jsx warnings (harmless in libs)
//     logOverride: { 'attribute-is-boolean': 'silent', 'non-boolean-attribute': 'silent' },
//   },
//   optimizeDeps: {
//     include: ['react-select', 'lucide-react', 'recharts'],  // Stabilize deps
//   },
//   server: {
//     port: 5174,
//   },
// });