import { useEffect, useRef, type RefObject } from 'react';

/** Revela, com animação, os elementos [data-reveal] dentro de root quando entram na tela. */
export function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}

/**
 * Chama onProgress com um valor de 0 a 1 enquanto o elemento atravessa a tela:
 * 0 quando o topo dele aparece embaixo, 1 quando o centro dele chega ao centro da tela.
 * Não causa novas renderizações: o callback costuma só gravar uma variável CSS.
 */
export function useScrollProgress(ref: RefObject<HTMLElement>, onProgress: (p: number) => void) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh;
      const end = vh / 2 - r.height / 2;
      const p = (start - r.top) / (start - end);
      cb.current(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
}

/** Diz se o elemento está visível na tela (callback, sem re-renderizar a cada frame). */
export function useInView(ref: RefObject<HTMLElement>, onChange: (visible: boolean) => void, rootMargin = '0px') {
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => cb.current(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
}
