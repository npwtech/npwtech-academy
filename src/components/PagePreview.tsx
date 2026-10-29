import { ArrowRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { EBOOK, PREVIEW, TOC } from '../data/ebook';
import { EbookBlocks } from './EbookBlocks';

interface Props {
  open: boolean;
  onClose: () => void;
  onBuy: () => void;
}

// Prévia gratuita: o livro se abre e mostra uma página do Capítulo 1.
export function PagePreview({ open, onClose, onBuy }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="preview"
      aria-labelledby="preview-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="preview__frame">
          <header className="preview__bar">
            <p className="tag">Prévia gratuita · página {PREVIEW.page}</p>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar prévia">
              <X />
            </button>
          </header>

          <div className="spread">
            <span className="spread__cover" aria-hidden="true" />
            <section className="spread__page spread__page--left" aria-hidden="true">
              <p className="spread__running">{EBOOK.title}</p>
              <div className="spread__opener">
                <span className="spread__big-n">01</span>
                <p className="tag">{PREVIEW.kicker}</p>
                <p className="spread__opener-title">{PREVIEW.title}</p>
              </div>
              <ol className="spread__toc">
                {TOC.slice(1, 5).map((c) => (
                  <li key={c.title} data-active={c.kicker === PREVIEW.kicker || undefined}>
                    <span>{c.kicker}</span>
                    <span>{c.title}</span>
                  </li>
                ))}
              </ol>
              <p className="spread__folio">{PREVIEW.page - 1}</p>
            </section>

            <article className="spread__page spread__page--right eb-content">
              <p className="spread__running">{PREVIEW.kicker}</p>
              <h2 id="preview-title" className="eb-chapter-title">
                {PREVIEW.title}
              </h2>
              <EbookBlocks blocks={PREVIEW.blocks} />
              <div className="spread__fade" aria-hidden="true" />
              <p className="spread__folio">{PREVIEW.page}</p>
            </article>
          </div>

          <footer className="preview__cta">
            <div>
              <strong>Gostou? O livro continua.</strong>
              <span>
                {TOC.length} capítulos, exercícios, checklists e o plano de 30 dias por {EBOOK.priceLabel}.
              </span>
            </div>
            <button type="button" className="btn btn-primary" onClick={onBuy}>
              Quero o ebook completo
              <ArrowRight />
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
