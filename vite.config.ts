import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Política de segurança de conteúdo (CSP) aplicada na versão publicada.
// Só permite scripts do próprio site, conexões com o Supabase e o Mercado Pago como destino de navegação.
// Fica fora do modo de desenvolvimento porque o Vite injeta scripts inline para recarregar a página.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

function securityHeaders(): Plugin {
  return {
    name: 'npw-security-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeaders()],
  build: {
    sourcemap: false,
  },
});
