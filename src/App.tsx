import { useEffect, useRef } from 'react';
import { AuthProvider } from './state/auth';
import { useRoute } from './state/router';
import { AppHeader } from './components/AppHeader';
import { Landing } from './components/Landing';
import { CHECKOUT_RETURN_KEY, Library } from './components/Library';
import { SiteFooter } from './components/SiteFooter';

// Volta do Mercado Pago (?compra=retorno): limpa a URL e abre a biblioteca para confirmar o pagamento.
function consumeCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('compra')) return;
  try {
    sessionStorage.setItem(CHECKOUT_RETURN_KEY, '1');
  } catch {
    // sem sessionStorage: o webhook libera o acesso mesmo assim
  }
  window.history.replaceState(null, '', `${window.location.pathname}#biblioteca`);
}
consumeCheckoutReturn();

function Shell() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);

  // Ao trocar de tela: volta ao topo (ou à seção pedida) e move o foco para o conteúdo.
  const routeKey = route.name === 'biblioteca' ? `biblioteca/${route.chapter ?? ''}` : route.name;
  const anchor = route.name === 'inicio' ? route.anchor : undefined;
  useEffect(() => {
    if (anchor) {
      const t = window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [routeKey, anchor]);

  return (
    <>
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
        Pular para o conteúdo
      </a>
      <AppHeader route={route} />
      <main id="conteudo" ref={mainRef} tabIndex={-1} className="app-main">
        {route.name === 'inicio' && <Landing />}
        {route.name === 'biblioteca' && <Library chapter={route.chapter} />}
      </main>
      {!(route.name === 'biblioteca' && route.chapter) && <SiteFooter />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
