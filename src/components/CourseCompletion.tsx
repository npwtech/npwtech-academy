import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, Globe, MessageCircle, Pause, Play } from 'lucide-react';
import { CLOSING_CTA, COURSE, MODULES, toSentences } from '../data/course';
import { ASSETS } from '../assets';
import { isModuleComplete, useProgress } from '../state/progress';
import { useSpeech } from '../state/speech';
import { RobotPresenter, type RobotState } from './RobotPresenter';
import '../styles/completion.css';

const CLOSING = toSentences([...CLOSING_CTA.paragraphs, CLOSING_CTA.signature]);

export function CourseCompletion() {
  const p = useProgress();
  const speech = useSpeech();
  const { summary, state } = p;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    speech.load('conclusao', CLOSING);
  }, [speech.load]);

  const mine = speech.trackId === 'conclusao';
  const status = mine ? speech.status : 'idle';
  const robotState: RobotState =
    status === 'playing' ? 'speaking' : status === 'paused' ? 'paused' : status === 'ended' || summary.allDone ? 'done' : 'idle';
  const missing = MODULES.filter((m) => !isModuleComplete(state.modules[m.id]));

  const m6 = p.get('modulo-6').exercise;
  const priorities = ['m1', 'm2', 'm3'].map((k) => (m6[k] ?? '').trim()).filter(Boolean);
  const top = m6.prioridade ? (m6[m6.prioridade] ?? '').trim() : '';

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(COURSE.whatsappLabel);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById('cta-phone');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div className="done-page">
      <section className="done-hero tech-grid" aria-labelledby="done-title">
        <div className="wrap done-hero__grid">
          <div className="done-hero__robot enter">
            <RobotPresenter
              state={robotState}
              variant="stage"
              label={robotState === 'done' && status !== 'ended' ? 'Parabéns!' : undefined}
            />
          </div>
          <div className="done-hero__copy">
            <p className="tag enter">{COURSE.title} · Conclusão</p>
            <h1 id="done-title" className="enter enter-1">
              {summary.allDone ? 'Você concluiu o curso.' : 'Falta pouco para concluir.'}
            </h1>
            <p className="done-hero__lead enter enter-2">
              {summary.allDone
                ? 'Você passou pelos seis módulos: presença digital, divulgação, site profissional, Google, conversão e plano de ação. Agora é hora de colocar em prática.'
                : `Você concluiu ${summary.completedModules} de ${summary.totalModules} módulos. Termine os módulos abaixo para fechar o curso.`}
            </p>

            {!summary.allDone && (
              <ul className="done-missing enter enter-3">
                {missing.map((m) => (
                  <li key={m.id}>
                    <a href={`#${m.id}`}>
                      <span className="tag">Módulo {m.number}</span>
                      {m.title}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="done-scores enter enter-3" role="list" aria-label="Notas dos quizzes">
              {MODULES.map((m) => {
                const q = p.get(m.id).quiz;
                const done = isModuleComplete(p.get(m.id));
                return (
                  <div role="listitem" key={m.id} className="done-score" data-done={done || undefined}>
                    <span className="tag">M{m.number}</span>
                    <strong>{q && p.get(m.id).quizDone ? `${q.score}/${q.total}` : '—'}</strong>
                    <span className="sr-only">{done ? 'concluído' : 'pendente'}</span>
                  </div>
                );
              })}
            </div>

            {priorities.length > 0 && (
              <div className="done-plan enter enter-4">
                <p className="tag">Seu plano para os próximos meses</p>
                <ol>
                  {priorities.map((t) => (
                    <li key={t} data-top={t === top || undefined}>
                      {t}
                      {t === top && <span className="done-plan__badge">Prioridade</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="light-band cta" aria-labelledby="cta-title">
        <div className="wrap cta__grid">
          <div className="cta__brand">
            <img src={ASSETS.logoFull} alt={ASSETS.logoFullAlt} width={180} height={148} />
          </div>
          <div className="cta__copy">
            <p className="tag">Próximo passo</p>
            <h2 id="cta-title">{CLOSING_CTA.title}</h2>
            {CLOSING_CTA.paragraphs.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <p className="cta__signature">{CLOSING_CTA.signature}</p>
            <div className="cta__actions">
              <a className="btn btn-dark" href={COURSE.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle />
                Solicitar um orçamento
              </a>
              <a className="btn btn-outline-dark" href={COURSE.site} target="_blank" rel="noopener noreferrer">
                <Globe />
                Conhecer a NPWTech
              </a>
              {speech.supported && state.settings.narration && (
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => (status === 'playing' ? speech.pause() : status === 'paused' ? speech.resume() : speech.play(status === 'ended' ? 0 : undefined))}
                >
                  {status === 'playing' ? <Pause /> : <Play />}
                  {status === 'playing' ? 'Pausar' : 'Ouvir mensagem do robô'}
                </button>
              )}
            </div>
            <dl className="cta__contacts">
              <div>
                <dt className="tag">WhatsApp</dt>
                <dd>
                  <span id="cta-phone">{COURSE.whatsappLabel}</span>
                  <button type="button" className="cta__copy-btn" onClick={copyPhone} aria-label="Copiar número do WhatsApp">
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="tag">Site</dt>
                <dd>{COURSE.siteLabel}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
