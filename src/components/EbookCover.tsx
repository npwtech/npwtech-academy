import { useRef, type CSSProperties, type PointerEvent, type RefObject } from 'react';
import { ASSETS } from '../assets';
import { EBOOK } from '../data/ebook';
import '../styles/ebook.css';

interface Props {
  /** Ângulo base em Y (graus). O ponteiro inclina o livro a partir daqui. */
  angle?: number;
  size?: 'md' | 'lg';
  onOpen?: () => void;
  label?: string;
}

// Livro em 3D feito só com CSS: capa, lombada, miolo e contracapa.
export function EbookCover({ angle = -28, size = 'md', onOpen, label }: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tilt-y', `${x * 22}deg`);
    el.style.setProperty('--tilt-x', `${-y * 14}deg`);
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--tilt-x', '0deg');
  };

  const style = { '--angle': `${angle}deg` } as CSSProperties;
  const content = (
    <>
      <span className="book__inner" aria-hidden="true">
        <span className="book__face book__front">
          <span className="book__grid" />
          <span className="book__top-row">
            <span>NPWTech · Ebook</span>
            <span>{EBOOK.edition}</span>
          </span>
          <img className="book__mark" src={ASSETS.logoMark} alt="" width={30} height={33} />
          <span className="book__title">
            Sua Empresa
            <br />
            no Digital
          </span>
          <span className="book__subtitle">O guia prático para ser encontrado e escolhido na internet</span>
          <span className="book__hex" />
          <span className="book__bottom-row">
            <span>8 capítulos</span>
            <span>Checklists · Exercícios · Plano de 30 dias</span>
          </span>
          <span className="book__glare" />
        </span>
        <span className="book__face book__spine">
          <span>Sua Empresa no Digital</span>
          <img src={ASSETS.logoMark} alt="" width={14} height={15} />
        </span>
        <span className="book__face book__pages" />
        <span className="book__face book__top" />
        <span className="book__face book__back" />
      </span>
      <span className="book__shadow" aria-hidden="true" />
    </>
  );

  if (onOpen) {
    return (
      <button
        ref={ref as RefObject<HTMLButtonElement>}
        type="button"
        className={`book book--${size} book--interactive`}
        style={style}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={onOpen}
        aria-label={label ?? `Abrir prévia do ebook ${EBOOK.title}`}
      >
        {content}
      </button>
    );
  }
  return (
    <span ref={ref} className={`book book--${size}`} style={style} onPointerMove={onMove} onPointerLeave={onLeave} role="img" aria-label={`Capa do ebook ${EBOOK.title}`}>
      {content}
    </span>
  );
}
