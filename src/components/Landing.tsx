import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  CircleCheck,
  ClipboardCheck,
  Eye,
  LockKeyhole,
  MousePointerClick,
  NotebookPen,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { EBOOK, FAQ, INSIDE, TOC, TOTAL_MINUTES } from '../data/ebook';
import { useInView, useReveal, useScrollProgress } from '../hooks/useScroll';
import { useOwnership } from '../state/library';
import { go } from '../state/router';
import { CheckoutDialog } from './CheckoutDialog';
import { EbookCover } from './EbookCover';
import { PagePreview } from './PagePreview';
import '../styles/landing.css';

const STATEMENT =
  'Seu cliente pesquisa antes de comprar. Se ele não encontra a sua empresa — ou não entende o que você faz — ele escolhe outra. E você nem fica sabendo.';
const STATEMENT_WORDS = STATEMENT.split(' ');

const JOURNEY = [
  { icon: Zap, title: 'Necessidade', text: 'Surge um problema. O ar parou, a festa está chegando, a empresa precisa de um site.' },
  { icon: Search, title: 'Pesquisa', text: 'Google, Instagram, Maps. Até quem recebe uma indicação pesquisa o nome antes de ligar.' },
  { icon: Eye, title: 'Comparação', text: 'Fotos, descrição, sinais de vida. Em segundos ele decide quem parece mais confiável.' },
  { icon: MousePointerClick, title: 'Decisão', text: 'Ganha quem passou mais segurança — e deixou o próximo passo mais fácil.' },
];

const INSIDE_ICONS = [BookOpenCheck, NotebookPen, ClipboardCheck, Smartphone];

const MARQUEE = ['Presença digital', 'Credibilidade', 'Site profissional', 'Google', 'WhatsApp', 'Chamadas para ação', 'Plano de 30 dias'];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [showcaseVisible, setShowcaseVisible] = useState(false);
  const { ownership } = useOwnership();
  const owned = ownership === 'owned';

  useReveal(root);

  // As palavras da frase de impacto acendem conforme a rolagem.
  useScrollProgress(statementRef, (p) => statementRef.current?.style.setProperty('--p', p.toFixed(3)));
  // O livro gira até ficar de frente quando a vitrine chega ao centro da tela.
  useScrollProgress(showcaseRef, (p) => {
    showcaseRef.current?.style.setProperty('--spin', `${((1 - p) * -46).toFixed(2)}deg`);
    showcaseRef.current?.style.setProperty('--lift', `${((1 - p) * 60).toFixed(1)}px`);
  });
  useInView(heroRef, setHeroVisible);
  useInView(showcaseRef, setShowcaseVisible, '-20% 0px -20% 0px');

  // Barra de leitura da página inteira.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty('transform', `scaleX(${max > 0 ? window.scrollY / max : 0})`);
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
  }, []);

  const buy = () => {
    setPreviewOpen(false);
    if (owned) go('#biblioteca');
    else setCheckoutOpen(true);
  };

  const toEbook = () => document.getElementById('ebook')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div ref={root} className="landing">
      <span className="read-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>

      {/* 1 · Abertura */}
      <section ref={heroRef} className="hero tech-grid" aria-labelledby="hero-title">
        <div className="hero__glow" aria-hidden="true" />
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <p className="hero__badge enter">
              <Sparkles aria-hidden="true" />
              Novo ebook da NPWTech
            </p>
            <h1 id="hero-title" className="hero__title enter enter-1">
              Sua empresa merece ser <em>encontrada.</em>
              <br />E escolhida.
            </h1>
            <p className="hero__lead enter enter-2">
              Um guia prático, sem jargão, para quem tem um negócio e quer transformar a presença na internet em clientes de
              verdade.
            </p>
            <div className="hero__actions enter enter-3">
              <button type="button" className="btn btn-primary btn-lg" onClick={toEbook}>
                Conhecer o ebook
                <ArrowDown />
              </button>
              <button type="button" className="btn btn-lg" onClick={() => setPreviewOpen(true)}>
                Ler uma página grátis
              </button>
            </div>
            <ul className="hero__facts enter enter-4" aria-label="Sobre o ebook">
              <li>
                <strong>{TOC.length}</strong>
                <span>capítulos</span>
              </li>
              <li>
                <strong>≈{TOTAL_MINUTES} min</strong>
                <span>de leitura</span>
              </li>
              <li>
                <strong>30 dias</strong>
                <span>de plano prático</span>
              </li>
            </ul>
          </div>

          <div className="hero__book enter enter-2">
            <div className="hero__orbit" aria-hidden="true" />
            <EbookCover angle={-24} size="md" onOpen={() => setPreviewOpen(true)} />
          </div>
        </div>
        <button type="button" className="scroll-cue" onClick={() => document.getElementById('problema')?.scrollIntoView({ behavior: 'smooth' })}>
          <span>Role para descobrir</span>
          <span className="scroll-cue__line" aria-hidden="true" />
        </button>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i}>
              {w}
              <i />
            </span>
          ))}
        </div>
      </div>

      {/* 2 · O problema */}
      <section id="problema" className="statement" aria-label="O problema">
        <div className="wrap">
          <p className="tag" data-reveal>
            O que acontece todos os dias
          </p>
          <p ref={statementRef} className="statement__text" style={{ '--n': STATEMENT_WORDS.length } as CSSProperties}>
            {STATEMENT_WORDS.map((w, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties}>
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 3 · A jornada */}
      <section className="journey" aria-labelledby="journey-title">
        <div className="wrap">
          <header className="section-head" data-reveal>
            <p className="tag">A jornada silenciosa do cliente</p>
            <h2 id="journey-title">Quatro etapas. Você só fica sabendo da última.</h2>
          </header>
          <ol className="journey__list">
            {JOURNEY.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                <span className="journey__n">{String(i + 1).padStart(2, '0')}</span>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="journey__bridge" data-reveal>
            Este ebook mostra, passo a passo, como estar bem posicionado em cada uma delas.
          </p>
        </div>
      </section>

      {/* 4 · Sumário */}
      <section id="sumario" className="toc-section" aria-labelledby="toc-title">
        <div className="wrap toc-section__grid">
          <header className="toc-section__head">
            <p className="tag" data-reveal>
              Sumário
            </p>
            <h2 id="toc-title" data-reveal>
              Do primeiro passo ao seu plano de ação
            </h2>
            <p data-reveal>
              Capítulos curtos, em ordem, cada um com algo para aplicar no mesmo dia. Leitura total de aproximadamente{' '}
              {TOTAL_MINUTES} minutos.
            </p>
          </header>
          <ol className="toc-list">
            {TOC.map((c, i) => (
              <li key={c.title} data-reveal>
                <span className="toc-list__n">{String(i).padStart(2, '0')}</span>
                <div>
                  <span className="tag">{c.kicker}</span>
                  <h3>{c.title}</h3>
                  <p>{c.summary}</p>
                </div>
                <span className="toc-list__min">{c.minutes} min</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 · Por dentro */}
      <section className="inside light-band" aria-labelledby="inside-title">
        <div className="wrap">
          <header className="section-head" data-reveal>
            <p className="tag">Por dentro do livro</p>
            <h2 id="inside-title">Não é só leitura. É um caderno de trabalho.</h2>
          </header>
          <ul className="inside__grid">
            {INSIDE.map((item, i) => {
              const Icon = INSIDE_ICONS[i];
              return (
                <li key={item.title} data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 6 · O livro */}
      <section id="ebook" ref={showcaseRef} className="showcase tech-grid" aria-labelledby="ebook-title">
        <div className="showcase__beam" aria-hidden="true" />
        <div className="wrap showcase__grid">
          <div className="showcase__stage">
            <EbookCover angle={-18} size="lg" onOpen={() => setPreviewOpen(true)} label="Abrir o livro e ler uma página grátis" />
            <p className="showcase__hint">
              <MousePointerClick aria-hidden="true" />
              Clique no livro e leia uma página
            </p>
          </div>

          <div className="offer" data-reveal>
            <p className="tag">Ebook · {EBOOK.edition}</p>
            <h2 id="ebook-title">{EBOOK.title}</h2>
            <p className="offer__sub">{EBOOK.subtitle}</p>
            <ul className="offer__list">
              {[
                `${TOC.length} capítulos práticos, do diagnóstico ao plano de ação`,
                'Exercícios e checklists para aplicar no seu negócio',
                'Plano de 30 dias, semana a semana',
                'Acesso imediato, vitalício, em qualquer aparelho',
              ].map((t) => (
                <li key={t}>
                  <CircleCheck aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="offer__price">
              <span className="offer__currency">R$</span>
              <span className="offer__value">{EBOOK.price}</span>
              <span className="offer__terms">
                pagamento único
                <br />
                {EBOOK.installments}
              </span>
            </div>
            <div className="offer__actions">
              <button type="button" className="btn btn-primary btn-lg offer__buy" onClick={buy}>
                {owned ? 'Ler meu ebook' : 'Comprar agora'}
                <ArrowRight />
              </button>
              <button type="button" className="btn btn-lg" onClick={() => setPreviewOpen(true)}>
                Ver prévia
              </button>
            </div>
            <ul className="offer__trust">
              <li>
                <ShieldCheck aria-hidden="true" /> Pagamento seguro via Mercado Pago
              </li>
              <li>
                <Zap aria-hidden="true" /> PIX liberado na hora
              </li>
              <li>
                <LockKeyhole aria-hidden="true" /> 7 dias para desistir
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7 · Dúvidas */}
      <section id="duvidas" className="faq" aria-labelledby="faq-title">
        <div className="wrap faq__grid">
          <header className="section-head" data-reveal>
            <p className="tag">Dúvidas frequentes</p>
            <h2 id="faq-title">Antes de comprar</h2>
          </header>
          <div className="faq__list">
            {FAQ.map((f) => (
              <details key={f.q} data-reveal>
                <summary>
                  {f.q}
                  <Plus aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · Fechamento */}
      <section className="closing" aria-labelledby="closing-title">
        <div className="wrap closing__inner" data-reveal>
          <h2 id="closing-title">Sua próxima etapa começa com conhecimento.</h2>
          <button type="button" className="btn btn-primary btn-lg" onClick={owned ? buy : toEbook}>
            {owned ? 'Ler meu ebook' : `Quero o ebook por ${EBOOK.priceLabel}`}
            <ArrowRight />
          </button>
        </div>
      </section>

      {/* Atalho fixo no celular, até a vitrine aparecer */}
      <div className="sticky-buy" data-show={(!heroVisible && !showcaseVisible) || undefined}>
        <span>
          <strong>{EBOOK.title}</strong>
          <small>Ebook · {EBOOK.priceLabel}</small>
        </span>
        <button type="button" className="btn btn-primary btn-sm" onClick={toEbook}>
          Ver o ebook
        </button>
      </div>

      <PagePreview open={previewOpen} onClose={() => setPreviewOpen(false)} onBuy={buy} />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
