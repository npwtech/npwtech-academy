import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Política de segurança de conteúdo (CSP) aplicada na versão publicada.
// Só permite scripts do próprio site e conexões com o projeto Supabase configurado no .env.
// Fica fora do modo de desenvolvimento porque o Vite injeta scripts inline para recarregar a página.
function buildCsp(supabaseUrl?: string) {
  let api = 'https://*.supabase.co wss://*.supabase.co';
  if (supabaseUrl) {
    const origin = new URL(supabaseUrl).origin;
    api = `${origin} ${origin.replace(/^https:/, 'wss:')}`;
  }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' ${api}`,
    "frame-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function securityHeaders(csp: string): Plugin {
  return {
    name: 'npw-security-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), securityHeaders(buildCsp(env.VITE_SUPABASE_URL))],
    build: {
      sourcemap: false,
    },
  };
});
