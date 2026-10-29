import { ArrowLeft, ArrowRight, List, LogOut, Minus, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Chapter } from '../data/ebook';
import { EBOOK } from '../data/ebook';
import { go } from '../state/router';
import { EbookBlocks } from './EbookBlocks';
import '../styles/reader.css';

interface Props {
  chapters: Chapter[];
  slug?: string;
  email: string;
  onSignOut: () => void;
}

const SIZES = [0.95, 1.05, 1.15, 1.28];

function readPref(key: string, fallback: number) {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && localStorage.getItem(key) !== null ? v : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: string | number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // preferências valem só nesta visita
  }
}

export function EbookReader({ chapters, slug, email, onSignOut }: Props) {
  const index = Math.max(0, chapters.findIndex((c) => c.slug === slug));
  const chapter = chapters[index];
  const [size, setSize] = useState(() => Math.min(SIZES.length - 1, Math.max(0, readPref('npw-ebook:size', 1))));
  const [tocOpen, setTocOpen] = useState(false);
  const pageRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Sem capítulo na URL: volta para onde o leitor parou.
  useEffect(() => {
    if (slug) return;
    let last: string | null = null;
    try {
      last = localStorage.getItem('npw-ebook:last');
    } catch {
      // sem armazenamento
    }
    if (last && last !== chapters[0].slug && chapters.some((c) => c.slug === last)) go(`#biblioteca/${last}`);
  }, [slug, chapters]);

  useEffect(() => {
    writePref('npw-ebook:last', chapter.slug);
    setTocOpen(false);
    window.scrollTo({ top: 0 });
  }, [chapter.slug]);

  useEffect(() => writePref('npw-ebook:size', size), [size]);

  // Progresso de leitura do capítulo atual.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = pageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      barRef.current?.style.setProperty('transform', `scaleX(${p})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [chapter.slug]);

  // Marca d'água com o e-mail do comprador: desestimula a redistribuição do conteúdo.
  const watermark = useMemo(() => {
    const text = `${email} · NPWTech`.replace(/[<>&'"]/g, '');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='220'><text x='0' y='120' transform='rotate(-24 180 110)' font-family='sans-serif' font-size='13' fill='rgba(20,20,22,0.07)'>${text}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [email]);

  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <div className="reader">
      <div className="reader__bar">
        <span ref={barRef} />
      </div>

      <aside className="reader__toc" data-open={tocOpen || undefined} aria-label="Sumário do ebook">
        <div className="reader__toc-head">
          <p className="tag">Sumário</p>
          <button type="button" className="icon-btn reader__toc-close" onClick={() => setTocOpen(false)} aria-label="Fechar sumário">
            <X />
          </button>
        </div>
        <ol>
          {chapters.map((c) => (
            <li key={c.slug}>
              <a href={`#biblioteca/${c.slug}`} aria-current={c.slug === chapter.slug ? 'page' : undefined}>
                <span className="tag">{c.kicker}</span>
                <span>{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="reader__account">
          <small>Licenciado para</small>
          <strong>{email}</strong>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onSignOut}>
            <LogOut /> Sair
          </button>
        </div>
      </aside>
      {tocOpen && <button type="button" className="reader__scrim" aria-label="Fechar sumário" onClick={() => setTocOpen(false)} />}

      <div className="reader__main">
        <div className="reader__tools">
          <button type="button" className="btn btn-sm reader__toc-btn" onClick={() => setTocOpen(true)}>
            <List /> Sumário
          </button>
          <p className="reader__where">
            <span className="tag">{chapter.kicker}</span>
            <span>{chapter.minutes} min de leitura</span>
          </p>
          <div className="reader__size" role="group" aria-label="Tamanho do texto">
            <button type="button" className="icon-btn" onClick={() => setSize((s) => Math.max(0, s - 1))} disabled={size === 0} aria-label="Diminuir texto">
              <Minus />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
              disabled={size === SIZES.length - 1}
              aria-label="Aumentar texto"
            >
              <Plus />
            </button>
          </div>
        </div>

        <article
          ref={pageRef}
          key={chapter.slug}
          className="reader__page eb-content"
          style={{ '--reader-scale': SIZES[size], '--watermark': watermark } as CSSProperties}
          onCopy={(e) => {
            if (!(e.target instanceof HTMLTextAreaElement)) e.preventDefault();
          }}
          onContextMenu={(e) => {
            if (!(e.target instanceof HTMLTextAreaElement)) e.preventDefault();
          }}
        >
          <header className="reader__opener">
            <p className="spread__running">{EBOOK.title}</p>
            <span className="reader__big-n" aria-hidden="true">
              {String(index).padStart(2, '0')}
            </span>
            <p className="tag">{chapter.kicker}</p>
            <h1 className="eb-chapter-title">{chapter.title}</h1>
            <p className="reader__summary">{chapter.summary}</p>
          </header>
          <EbookBlocks blocks={chapter.blocks} />
          <p className="reader__license">Licenciado para {email}. Uso pessoal; a redistribuição não é permitida.</p>
        </article>

        <nav className="reader__pager" aria-label="Navegação entre capítulos">
          {prev ? (
            <a href={`#biblioteca/${prev.slug}`} className="reader__pager-link">
              <ArrowLeft aria-hidden="true" />
              <span>
                <small>Anterior</small>
                {prev.title}
              </span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={`#biblioteca/${next.slug}`} className="reader__pager-link reader__pager-link--next">
              <span>
                <small>Próximo</small>
                {next.title}
              </span>
              <ArrowRight aria-hidden="true" />
            </a>
          ) : (
            <a href="#inicio" className="reader__pager-link reader__pager-link--next">
              <span>
                <small>Fim do livro</small>
                Voltar ao início
              </span>
              <ArrowRight aria-hidden="true" />
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
