import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Estilos globais primeiro: o CSS de cada tela vem depois e pode sobrescrevê-los.
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import App from './App';

// Ativa as animações de revelação ao rolar só quando o JavaScript está rodando.
document.documentElement.classList.add('js-reveal');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
