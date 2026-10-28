import { ArrowRight, Headphones, ListChecks, Pause, Play, PenLine } from 'lucide-react';
import { useEffect } from 'react';
import { COURSE, MODULES, OPENING_SCRIPT, TOTAL_MINUTES, toSentences } from '../data/course';
import { ASSETS } from '../assets';
import { useSpeech } from '../state/speech';
import { useProgress } from '../state/progress';
import { RobotPresenter, type RobotState } from './RobotPresenter';
import '../styles/landing.css';

const INTRO = toSentences(OPENING_SCRIPT);

export function Landing() {
  const speech = useSpeech();
  const { state, summary } = useProgress();
  const mine = speech.trackId === 'abertura';

  useEffect(() => {
    speech.load('abertura', INTRO);
  }, [speech.load]);

  const robotState: RobotState =
    !mine || !speech.supported
      ? 'idle'
      : speech.status === 'playing'
        ? 'speaking'
        : speech.status === 'paused'
          ? 'paused'
          : speech.status === 'ended'
            ? 'done'
            : speech.status === 'error'
              ? 'error'
              : 'idle';

  const started = Object.keys(state.modules).length > 0;
  const playing = mine && speech.status === 'playing';

  const toggleIntro = () => {
    if (!mine) speech.load('abertura', INTRO);
    if (playing) speech.pause();
    else if (mine && speech.status === 'paused') speech.resume();
    else speech.play(speech.status === 'ended' ? 0 : undefined);
  };

  const caption =
    mine && speech.status !== 'idle' && speech.status !== 'error'
      ? speech.sentences[speech.index]
      : 'Olá! Eu sou o robô da NPWTech e vou apresentar este curso para você.';

  return (
    <>
      <section className="hero tech-grid" aria-labelledby="hero-title">
        <div className="hero__smoke" aria-hidden="true" />
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <p className="tag enter">{COURSE.platform} · Curso 01</p>
            <h1 id="hero-title" className="hero__title enter enter-1">
              Sua Empresa
              <br />
              no Digital
            </h1>
            <p className="hero__tagline enter enter-2">{COURSE.tagline}</p>
            <p className="hero__lead enter enter-2">{COURSE.description}</p>
            <div className="hero__actions enter enter-3">
              <a className="btn btn-primary" href="#painel">
                {started ? 'Continuar o curso' : 'Começar o curso'}
                <ArrowRight />
              </a>
              <a className="btn" href="#aulas">
                Conhecer as aulas
              </a>
            </div>
            <ul className="hero__facts enter enter-4" aria-label="Sobre o curso">
              <li>
                <span className="tag">Nível</span>
                <strong>Iniciante</strong>
              </li>
              <li>
                <span className="tag">Módulos</span>
                <strong>{MODULES.length} aulas</strong>
              </li>
              <li>
                <span className="tag">Duração</span>
                <strong>≈ {TOTAL_MINUTES} min</strong>
              </li>
              <li>
                <span className="tag">Formato</span>
                <strong>Narrado em português</strong>
              </li>
            </ul>
            {started && (
              <p className="hero__progress enter enter-4">
                <span className="hero__progress-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${summary.percent / 100})` }} />
                </span>
                Você já fez {summary.percent}% do curso.
              </p>
            )}
          </div>

          <div className="hero__stage enter enter-2">
            <div className="stage-card">
              <span className="stage-card__corner tag" aria-hidden="true">
                Apresentador
              </span>
              <RobotPresenter state={robotState} variant="hero" />
              <div className="speech-bubble" aria-live="polite">
                <p>{caption}</p>
                {speech.supported ? (
                  <button type="button" className="btn btn-sm" onClick={toggleIntro} disabled={!state.settings.narration}>
                    {playing ? <Pause /> : <Play />}
                    {playing ? 'Pausar' : mine && speech.status === 'paused' ? 'Continuar' : 'Ouvir apresentação'}
                  </button>
                ) : (
                  <p className="speech-bubble__note">Seu navegador não oferece narração por voz.</p>
                )}
                {speech.supported && !state.settings.narration && (
                  <p className="speech-bubble__note">A narração está desativada nas configurações.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="aulas" className="modules-section" aria-labelledby="aulas-title">
        <div className="wrap">
          <header className="section-head">
            <p className="tag">Conteúdo do curso</p>
            <h2 id="aulas-title">Seis módulos, do primeiro passo ao seu plano de ação</h2>
            <p>
              Cada módulo tem uma aula narrada pelo robô, um exercício para aplicar no seu negócio e um quiz rápido de
              revisão. As aulas seguem uma ordem, mas você pode revisitar qualquer uma quando quiser.
            </p>
          </header>
          <ol className="module-grid">
            {MODULES.map((m) => (
              <li key={m.id} className="module-card">
                <a href={`#${m.id}`} className="module-card__link">
                  <span className="module-card__top">
                    <span className="tag">Módulo {String(m.number).padStart(2, '0')}</span>
                    <span className="module-card__time">{m.duration}</span>
                  </span>
                  <h3>{m.title}</h3>
                  <ul>
                    {m.topics.slice(0, 3).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <span className="module-card__go">
                    Abrir aula <ArrowRight aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="light-band how" aria-labelledby="how-title">
        <div className="wrap how__inner">
          <header className="how__head">
            <p className="tag">Como as aulas funcionam</p>
            <h2 id="how-title">Ouça, pratique e revise no seu ritmo</h2>
          </header>
          <ul className="how__list">
            <li>
              <Headphones aria-hidden="true" />
              <h3>O robô apresenta</h3>
              <p>A narração usa a voz do seu navegador, com legendas e transcrição completa para acompanhar sem áudio.</p>
            </li>
            <li>
              <PenLine aria-hidden="true" />
              <h3>Você pratica</h3>
              <p>Cada aula termina com um exercício aplicado à sua empresa. Suas respostas ficam guardadas neste navegador.</p>
            </li>
            <li>
              <ListChecks aria-hidden="true" />
              <h3>Você revisa</h3>
              <p>Três perguntas por módulo, com explicação de cada resposta. Dá para tentar de novo quantas vezes quiser.</p>
            </li>
          </ul>
          <div className="how__footer">
            <img src={ASSETS.logoFull} alt={ASSETS.logoFullAlt} className="how__logo" width={136} height={112} />
            <p>Um curso da NPWTech, empresa de desenvolvimento de sites, sistemas e aplicativos.</p>
            <a className="btn btn-dark" href="#painel">
              {started ? 'Continuar o curso' : 'Começar o curso'}
              <ArrowRight />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
