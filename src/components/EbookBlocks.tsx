import { Check, Lightbulb, TriangleAlert } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { Block } from '../data/ebook';
import { ASSETS } from '../assets';
import '../styles/ebook.css';

// Renderiza o conteúdo do livro como elementos React (nunca como HTML cru),
// então nenhum texto vindo do banco consegue injetar código na página.

/** Converte **trecho** em <strong>. */
function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

// Caderno do leitor: marcações e respostas ficam somente neste navegador.
function useNotebook<T>(key: string, initial: T) {
  const storageKey = `npw-ebook:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // armazenamento indisponível: as respostas valem enquanto a página estiver aberta
    }
  }, [storageKey, value]);
  return [value, setValue] as const;
}

function Checklist({ block }: { block: Extract<Block, { t: 'checklist' }> }) {
  const [done, setDone] = useNotebook<number[]>(`check:${block.id}`, []);
  const toggle = (i: number) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  return (
    <fieldset className="eb-checklist">
      <legend>
        <span>{block.title}</span>
        <span className="eb-checklist__count">
          {done.length}/{block.items.length}
        </span>
      </legend>
      {block.items.map((item, i) => (
        <label key={i} className="eb-checklist__item" data-done={done.includes(i) || undefined}>
          <input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} />
          <span className="eb-checklist__box" aria-hidden="true">
            <Check />
          </span>
          <span>{item}</span>
        </label>
      ))}
    </fieldset>
  );
}

function Exercise({ block }: { block: Extract<Block, { t: 'exercise' }> }) {
  const [answers, setAnswers] = useNotebook<Record<string, string>>(`ex:${block.id}`, {});
  return (
    <section className="eb-exercise" aria-label={block.title}>
      <p className="eb-exercise__tag">Exercício</p>
      <h4>{block.title.replace(/^Exercício:\s*/i, '')}</h4>
      <p>{rich(block.text)}</p>
      {block.fields.map((f) => (
        <label key={f.id} className="eb-exercise__field">
          <span>{f.label}</span>
          <textarea
            rows={2}
            maxLength={2000}
            placeholder={f.placeholder}
            value={answers[f.id] ?? ''}
            onChange={(e) => setAnswers((a) => ({ ...a, [f.id]: e.target.value }))}
          />
        </label>
      ))}
      <p className="eb-exercise__note">Suas respostas ficam salvas apenas neste navegador.</p>
    </section>
  );
}

const CALLOUT_ICON = { tip: Lightbulb, alert: TriangleAlert } as const;

export function EbookBlock({ block }: { block: Block }) {
  switch (block.t) {
    case 'p':
      return <p className="eb-p">{rich(block.text)}</p>;
    case 'h':
      return <h3 className="eb-h">{block.text}</h3>;
    case 'list':
      return (
        <ul className="eb-list">
          {block.items.map((item, i) => (
            <li key={i}>{rich(item)}</li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="eb-steps">
          {block.items.map((s, i) => (
            <li key={i}>
              <span className="eb-steps__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{s.title}</strong>
                <p>{rich(s.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <figure className="eb-quote">
          <blockquote>{block.text}</blockquote>
          {block.cite && <figcaption>— {block.cite}</figcaption>}
        </figure>
      );
    case 'callout': {
      if (block.tone === 'npw') {
        return (
          <aside className="eb-callout eb-callout--npw">
            <img src={ASSETS.logoMark} alt="" width={28} height={30} />
            <div>
              <strong>{block.title}</strong>
              <p>{rich(block.text)}</p>
            </div>
          </aside>
        );
      }
      const Icon = CALLOUT_ICON[block.tone];
      return (
        <aside className={`eb-callout eb-callout--${block.tone}`}>
          <Icon aria-hidden="true" />
          <div>
            <strong>{block.title}</strong>
            <p>{rich(block.text)}</p>
          </div>
        </aside>
      );
    }
    case 'compare':
      return (
        <div className="eb-compare">
          {[block.left, block.right].map((side, i) => (
            <div key={i} className={i === 0 ? 'eb-compare__col eb-compare__col--a' : 'eb-compare__col eb-compare__col--b'}>
              <strong>{side.title}</strong>
              <ul>
                {side.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case 'checklist':
      return <Checklist block={block} />;
    case 'exercise':
      return <Exercise block={block} />;
    case 'divider':
      return <hr className="eb-divider" />;
    default:
      return null;
  }
}

export function EbookBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <EbookBlock key={i} block={b} />
      ))}
    </>
  );
}
