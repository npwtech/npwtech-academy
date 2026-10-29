import { useEffect, useState } from 'react';

// Navegação por âncoras simples (#inicio, #ebook, #biblioteca, #biblioteca/capitulo).
// Funciona em qualquer hospedagem estática, sem configuração de servidor.
export type Route = { name: 'inicio'; anchor?: string } | { name: 'biblioteca'; chapter?: string };

const LANDING_ANCHORS = new Set(['ebook', 'sumario', 'duvidas', 'problema']);

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  const lib = h.match(/^biblioteca(?:\/([a-z0-9-]{1,60}))?$/);
  if (lib) return { name: 'biblioteca', chapter: lib[1] };
  if (LANDING_ANCHORS.has(h)) return { name: 'inicio', anchor: h };
  return { name: 'inicio' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function go(hash: string) {
  const target = hash.startsWith('#') ? hash : `#${hash}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}
