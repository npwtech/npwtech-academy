import { useEffect, useState } from 'react';

// Navegação por âncoras simples (#painel, #modulo-1, #conclusao).
// Funciona sem servidor, inclusive abrindo o arquivo direto no navegador.
export type Route =
  | { name: 'inicio'; anchor?: string }
  | { name: 'painel' }
  | { name: 'modulo'; id: string; anchor?: string }
  | { name: 'conclusao' };

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (h === 'painel') return { name: 'painel' };
  if (h === 'conclusao') return { name: 'conclusao' };
  const m = h.match(/^(modulo-[1-6])(?:-(exercicio|quiz))?$/);
  if (m) return { name: 'modulo', id: m[1], anchor: m[2] ? h : undefined };
  if (h === 'aulas') return { name: 'inicio', anchor: 'aulas' };
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
