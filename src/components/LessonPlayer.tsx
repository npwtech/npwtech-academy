import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, Menu, Target, Info, Settings2 } from 'lucide-react';
import { COURSE, MODULES, narrationFor, type CourseModule } from '../data/course';
import { isModuleComplete, useProgress } from '../state/progress';
import { useSpeech } from '../state/speech';
import { RobotPresenter, type RobotState } from './RobotPresenter';
import { AudioControls } from './AudioControls';
import { LessonTranscript } from './LessonTranscript';
import { ExercisePanel } from './ExercisePanel';
import { QuizPanel } from './QuizPanel';
import { CourseSidebar } from './CourseSidebar';
import { ProgressBar, StepChips } from './ProgressIndicator';
import { ASSETS } from '../assets';
import '../styles/lesson.css';

export function LessonPlayer({ mod, onOpenSettings }: { mod: CourseModule; onOpenSettings: () => void }) {
  const p = useProgress();
  const speech = useSpeech();
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const sentences = useMemo(() => narrationFor(mod), [mod]);
  const mp = p.get(mod.id);
  const done = isModuleComplete(mp);
  const idx = MODULES.findIndex((m) => m.id === mod.id);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];

  const markContent = p.markContent;
  const onEnded = useCallback(() => markContent(mod.id, true), [markContent, mod.id]);

  // Carrega a narração desta aula (interrompe qualquer outra que esteja tocando).
  useEffect(() => {
    speech.load(mod.id, sentences, onEnded);
  }, [speech.load, mod.id, sentences, onEnded]);

  useEffect(() => {
    p.visit(mod.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.id]);

  const mine = speech.trackId === mod.id;
  const status = mine ? speech.status : 'idle';
  const robotState: RobotState =
    status === 'playing' ? 'speaking' : status === 'paused' ? 'paused' : status === 'ended' ? 'done' : status === 'error' ? 'error' : 'idle';
  const index = mine ? speech.index : 0;
  const narrationProgress = status === 'ended' ? 1 : sentences.length ? index / sentences.length : 0;
  const caption = sentences[index] ?? '';
  const showCaption = p.state.settings.captions;

  return (
    <div className="lesson-layout">
      <CourseSidebar currentId={mod.id} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lesson">
        <div className="lesson__toolbar">
          <button
            type="button"
            className="btn btn-sm lesson__menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-controls="course-menu"
            aria-expanded={menuOpen}
          >
            <Menu />
            Módulos
          </button>
          <p className="tag">
            Módulo {String(mod.number).padStart(2, '0')} de {String(MODULES.length).padStart(2, '0')} · {mod.lessonLabel}
          </p>
          <div className="lesson__toolbar-steps">
            <StepChips p={mp} compact />
          </div>
        </div>

        <header className="lesson__head enter">
          <h1>{mod.title}</h1>
          <dl className="lesson__meta">
            <div>
              <dt>
                <Clock aria-hidden="true" />
                Duração
              </dt>
              <dd>{mod.duration}</dd>
            </div>
            <div>
              <dt>
                <Target aria-hidden="true" />
                Objetivo
              </dt>
              <dd>{mod.objective}</dd>
            </div>
          </dl>
          <ul className="lesson__topics" aria-label="Conteúdo da aula">
            {mod.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </header>

        <section className="stage enter enter-1" aria-label="Apresentação do robô">
          <div className="stage__robot tech-grid">
            <RobotPresenter state={robotState} variant="stage" />
          </div>
          <div className="stage__panel">
            <div className="stage__caption-head">
              <span className="tag">{showCaption ? 'Legenda' : 'Narração'}</span>
              <span className="stage__counter">
                Frase {Math.min(index + 1, sentences.length)} de {sentences.length}
              </span>
            </div>
            {showCaption ? (
              <p className="stage__caption" aria-live={status === 'playing' ? 'off' : 'polite'} key={index}>
                {caption}
              </p>
            ) : (
              <p className="stage__caption stage__caption--muted">Legendas desativadas nas configurações.</p>
            )}
            <ProgressBar value={narrationProgress} label="Progresso da narração" />

            {!speech.supported && (
              <p className="notice notice--error">
                <AlertTriangle />
                <span>
                  <strong>Narração indisponível.</strong> Seu navegador não oferece síntese de voz. Acompanhe pela
                  transcrição e use as setas para avançar as frases.
                </span>
              </p>
            )}
            {speech.supported && !p.state.settings.narration && (
              <p className="notice">
                <Info />
                <span>A narração está desligada. Use a transcrição ou ligue a narração abaixo.</span>
              </p>
            )}
            {mine && speech.error && (
              <p className="notice notice--error" role="alert">
                <AlertTriangle />
                <span>{speech.error}</span>
              </p>
            )}

            <AudioControls trackId={mod.id} transcriptOpen={transcriptOpen} onToggleTranscript={() => setTranscriptOpen((v) => !v)} />

            <div className="stage__foot">
              {mp.contentDone ? (
                <p className="stage__done">
                  <Check aria-hidden="true" />
                  Aula concluída
                </p>
              ) : (
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => p.markContent(mod.id, true)}>
                  <Check />
                  Marcar aula como concluída
                </button>
              )}
              <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenSettings}>
                <Settings2 />
                Voz e acessibilidade
              </button>
            </div>
          </div>
        </section>

        <LessonTranscript mod={mod} open={transcriptOpen} />

        {mod.note && (
          <aside className="note" aria-label="Da NPWTech">
            <img src={ASSETS.logoMark} alt="" width={28} height={31} />
            <div>
              <p className="note__title">{mod.note.title}</p>
              <p>{mod.note.text}</p>
              {mod.number === 3 && (
                <a href={COURSE.whatsapp} target="_blank" rel="noopener noreferrer" className="note__link">
                  Solicitar um orçamento <ArrowRight aria-hidden="true" />
                </a>
              )}
            </div>
          </aside>
        )}

        <ExercisePanel mod={mod} />
        <QuizPanel mod={mod} />

        <section className="lesson__end" data-done={done || undefined} aria-live="polite">
          <div className="lesson__end-status">
            <span className="lesson__end-icon" aria-hidden="true">
              {done ? <Check /> : <span>{String(mod.number).padStart(2, '0')}</span>}
            </span>
            <div>
              <p className="lesson__end-title">{done ? 'Módulo concluído' : 'Para concluir este módulo'}</p>
              <p className="lesson__end-text">
                {done
                  ? next
                    ? `Ótimo trabalho. Próximo: ${next.title}`
                    : 'Você chegou ao fim do curso. Veja a mensagem final.'
                  : 'Termine a aula (ouvindo a narração ou marcando como concluída) e responda às três perguntas do quiz.'}
              </p>
            </div>
          </div>
          <nav className="lesson__nav" aria-label="Navegação entre aulas">
            {prev ? (
              <a className="btn" href={`#${prev.id}`}>
                <ArrowLeft />
                Aula anterior
              </a>
            ) : (
              <a className="btn" href="#painel">
                <ArrowLeft />
                Meu painel
              </a>
            )}
            {next ? (
              <a className={`btn ${done ? 'btn-primary' : ''}`} href={`#${next.id}`}>
                Próxima aula
                <ArrowRight />
              </a>
            ) : (
              <a className={`btn ${done ? 'btn-primary' : ''}`} href="#conclusao">
                Concluir curso
                <ArrowRight />
              </a>
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}
