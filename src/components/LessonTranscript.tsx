import { useMemo } from 'react';
import { toSentences, type CourseModule } from '../data/course';
import { useSpeech } from '../state/speech';
import { useProgress } from '../state/progress';

/**
 * Transcrição completa da aula, organizada em parágrafos.
 * A frase narrada fica destacada; clicar numa frase leva a narração (ou a legenda) até ela.
 */
export function LessonTranscript({ mod, open }: { mod: CourseModule; open: boolean }) {
  const speech = useSpeech();
  const mine = speech.trackId === mod.id;
  const { state } = useProgress();
  const canSpeak = speech.supported && state.settings.narration;
  const go = (i: number) => {
    if (canSpeak && speech.status !== 'playing' && speech.status !== 'paused') speech.play(i);
    else speech.seek(i);
  };

  const paragraphs = useMemo(() => {
    let offset = 0;
    const paras = [...mod.script, `Exercício prático: ${mod.exercise.prompt}`];
    return paras.map((p) => {
      const sentences = toSentences([p]).map((s, i) => ({ s, i: offset + i }));
      offset += sentences.length;
      return sentences;
    });
  }, [mod]);

  return (
    <section
      id={`${mod.id}-transcricao`}
      className="transcript"
      aria-labelledby={`${mod.id}-transcricao-title`}
      hidden={!open}
    >
      <div className="transcript__head">
        <h2 id={`${mod.id}-transcricao-title`}>Transcrição da aula</h2>
        <p>{canSpeak ? 'Selecione uma frase para ouvir a partir dela.' : 'Selecione uma frase para levar a legenda até ela.'}</p>
      </div>
      <div className="transcript__body">
        {paragraphs.map((para, pi) => (
          <p key={pi}>
            {para.map(({ s, i }) => (
              <span key={i}>
                {/* span com papel de botão: mantém o texto corrido, sem quebrar linha a cada frase */}
                <span
                  role="button"
                  tabIndex={0}
                  className="transcript__s"
                  data-current={mine && speech.index === i && speech.status !== 'idle' ? true : undefined}
                  data-past={mine && i < speech.index ? true : undefined}
                  onClick={() => go(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      go(i);
                    }
                  }}
                >
                  {s}
                </span>{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}
