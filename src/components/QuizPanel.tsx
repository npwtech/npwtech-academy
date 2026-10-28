import { useState } from 'react';
import { Check, ListChecks, RotateCcw, X } from 'lucide-react';
import type { CourseModule } from '../data/course';
import { useProgress } from '../state/progress';

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuizPanel({ mod }: { mod: CourseModule }) {
  const p = useProgress();
  const saved = p.get(mod.id);
  const total = mod.quiz.length;
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => saved.quiz?.answers?.length === total ? saved.quiz.answers : Array(total).fill(null),
  );
  const attempts = saved.quiz?.attempts ?? 0;

  const answered = answers.filter((a) => a !== null).length;
  const score = answers.reduce<number>((s, a, i) => s + (a === mod.quiz[i].correct ? 1 : 0), 0);
  const finished = answered === total;

  const choose = (qi: number, oi: number) => {
    if (answers[qi] !== null) return; // resposta registrada; não muda depois de respondida
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    const nAnswered = next.filter((a) => a !== null).length;
    const nScore = next.reduce<number>((s, a, i) => s + (a === mod.quiz[i].correct ? 1 : 0), 0);
    const done = nAnswered === total;
    p.saveQuiz(mod.id, { answers: next, score: nScore, total, attempts: done ? attempts + 1 : attempts }, done || saved.quizDone);
  };

  const retry = () => {
    const empty = Array(total).fill(null);
    setAnswers(empty);
    // mantém a conclusão anterior do módulo; a nova tentativa substitui a nota ao terminar
    p.saveQuiz(mod.id, saved.quiz ? { ...saved.quiz, answers: empty } : undefined, saved.quizDone);
  };

  return (
    <section
      id={`${mod.id}-quiz`}
      className="panel quiz"
      aria-labelledby={`${mod.id}-quiz-title`}
      tabIndex={-1}
      data-done={saved.quizDone || undefined}
    >
      <header className="panel__head">
        <span className="panel__icon" aria-hidden="true">
          {saved.quizDone ? <Check /> : <ListChecks />}
        </span>
        <div>
          <p className="tag">Quiz de revisão · Módulo {mod.number}</p>
          <h2 id={`${mod.id}-quiz-title`}>Teste o que você aprendeu</h2>
        </div>
        <p className="quiz__score" aria-live="polite">
          <span className="sr-only">Pontuação: </span>
          <strong>{score}</strong>/{total}
          <small>
            {answered}/{total} respondidas
          </small>
        </p>
      </header>

      <ol className="quiz__list">
        {mod.quiz.map((q, qi) => {
          const a = answers[qi];
          const isAnswered = a !== null;
          const right = a === q.correct;
          return (
            <li key={q.id} className="question" data-answered={isAnswered || undefined}>
              <fieldset>
                <legend>
                  <span className="question__n">Pergunta {qi + 1}</span>
                  {q.prompt}
                </legend>
                <div className="options">
                  {q.options.map((opt, oi) => {
                    const chosen = a === oi;
                    const isCorrect = isAnswered && oi === q.correct;
                    const isWrongChoice = chosen && !right;
                    return (
                      <button
                        key={oi}
                        type="button"
                        className="option"
                        data-correct={isCorrect || undefined}
                        data-wrong={isWrongChoice || undefined}
                        data-dim={isAnswered && !isCorrect && !isWrongChoice ? true : undefined}
                        aria-pressed={chosen}
                        aria-disabled={isAnswered}
                        onClick={() => choose(qi, oi)}
                      >
                        <span className="option__letter" aria-hidden="true">
                          {isCorrect ? <Check /> : isWrongChoice ? <X /> : LETTERS[oi]}
                        </span>
                        <span className="option__text">{opt}</span>
                        {isCorrect && <span className="option__tag">Resposta correta</span>}
                        {isWrongChoice && <span className="option__tag">Sua resposta</span>}
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div className="feedback" role="status">
                    <p className="feedback__verdict">
                      {right ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
                      {right ? 'Isso mesmo!' : `Não foi dessa vez. A resposta correta é a ${LETTERS[q.correct]}.`}
                    </p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {finished && (
        <div className="quiz__result" role="status">
          <p>
            <strong>
              Você acertou {score} de {total}.
            </strong>{' '}
            {score === total
              ? 'Excelente revisão!'
              : score >= 2
                ? 'Bom resultado. Se quiser, revise a transcrição e tente de novo.'
                : 'Vale revisar a aula e tentar novamente.'}
          </p>
          <button type="button" className="btn btn-sm" onClick={retry}>
            <RotateCcw />
            Tentar novamente
          </button>
        </div>
      )}
    </section>
  );
}
