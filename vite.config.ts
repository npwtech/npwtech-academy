import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera um único dist/index.html com CSS, JS e imagens embutidos.
// Assim o curso pode ser aberto direto no navegador ou hospedado em qualquer servidor estático.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
});
