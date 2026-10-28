import { useEffect, useRef, useState } from 'react';
import { Check, PenLine } from 'lucide-react';
import type { CourseModule } from '../data/course';
import { useProgress } from '../state/progress';

const CHECK_ON = '1';

export function ExercisePanel({ mod }: { mod: CourseModule }) {
  const p = useProgress();
  const saved = p.get(mod.id);
  const [values, setValues] = useState<Record<string, string>>(saved.exercise);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);
  const done = saved.exerciseDone;

  // Salva o rascunho automaticamente enquanto o aluno escreve.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      p.saveExercise(mod.id, values);
      setSavedAt(Date.now());
    }, 500);
    return () => window.clearTimeout(t);
  }, [values]);

  const set = (id: string, v: string) => {
    setError(null);
    setValues((prev) => ({ ...prev, [id]: v }));
  };

  const textFields = mod.exercise.fields.filter((f) => f.kind === 'textarea' || f.kind === 'input');
  const filled = textFields.filter((f) => (values[f.id] ?? '').trim()).length;

  const complete = () => {
    if (filled === 0) {
      setError('Escreva pelo menos uma resposta antes de concluir o exercício.');
      return;
    }
    p.saveExercise(mod.id, values, true);
    setSavedAt(Date.now());
  };

  return (
    <section
      id={`${mod.id}-exercicio`}
      className="panel exercise"
      aria-labelledby={`${mod.id}-ex-title`}
      tabIndex={-1}
      data-done={done || undefined}
    >
      <header className="panel__head">
        <span className="panel__icon" aria-hidden="true">
          {done ? <Check /> : <PenLine />}
        </span>
        <div>
          <p className="tag">Exercício prático · Módulo {mod.number}</p>
          <h2 id={`${mod.id}-ex-title`}>Aplique no seu negócio</h2>
        </div>
        {done && <span className="pill pill--done">Concluído</span>}
      </header>
      <p className="exercise__prompt">{mod.exercise.prompt}</p>

      <form
        className="exercise__form"
        onSubmit={(e) => {
          e.preventDefault();
          complete();
        }}
      >
        {mod.exercise.fields.map((f) => {
          const fid = `${mod.id}-${f.id}`;
          if (f.kind === 'textarea')
            return (
              <div className="field" key={f.id}>
                <label htmlFor={fid}>{f.label}</label>
                <textarea
                  id={fid}
                  className="textarea"
                  rows={f.rows ?? 4}
                  placeholder={f.placeholder}
                  value={values[f.id] ?? ''}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              </div>
            );
          if (f.kind === 'input')
            return (
              <div className="field" key={f.id}>
                <label htmlFor={fid}>{f.label}</label>
                <input
                  id={fid}
                  className="input"
                  placeholder={f.placeholder}
                  value={values[f.id] ?? ''}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              </div>
            );
          if (f.kind === 'checklist')
            return (
              <fieldset className="field checks" key={f.id}>
                <legend>{f.label}</legend>
                {f.items.map((it) => {
                  const key = `${f.id}.${it.id}`;
                  const on = values[key] === CHECK_ON;
                  return (
                    <label key={it.id} className="check" htmlFor={`${fid}-${it.id}`}>
                      <input
                        id={`${fid}-${it.id}`}
                        type="checkbox"
                        checked={on}
                        onChange={(e) => set(key, e.target.checked ? CHECK_ON : '')}
                      />
                      <span className="check__box" aria-hidden="true">
                        {on && <Check />}
                      </span>
                      <span>{it.label}</span>
                    </label>
                  );
                })}
              </fieldset>
            );
          // prioridade entre as melhorias digitadas
          const options = f.from.map((src) => ({ src, text: (values[src] ?? '').trim() })).filter((o) => o.text);
          return (
            <fieldset className="field checks" key={f.id}>
              <legend>{f.label}</legend>
              {options.length === 0 ? (
                <p className="exercise__hint">Escreva suas melhorias acima para escolher a prioridade.</p>
              ) : (
                options.map((o) => (
                  <label key={o.src} className="check check--radio" htmlFor={`${fid}-${o.src}`}>
                    <input
                      id={`${fid}-${o.src}`}
                      type="radio"
                      name={fid}
                      checked={values[f.id] === o.src}
                      onChange={() => set(f.id, o.src)}
                    />
                    <span className="check__box" aria-hidden="true">
                      {values[f.id] === o.src && <Check />}
                    </span>
                    <span>{o.text}</span>
                  </label>
                ))
              )}
            </fieldset>
          );
        })}

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        <div className="exercise__actions">
          <button type="submit" className="btn btn-primary">
            <Check />
            {done ? 'Atualizar respostas' : 'Concluir exercício'}
          </button>
          <span className="exercise__saved" aria-live="polite">
            {p.storageAvailable
              ? savedAt
                ? 'Rascunho salvo neste navegador.'
                : 'Suas respostas são salvas automaticamente neste navegador.'
              : 'Não foi possível salvar neste navegador; as respostas valem enquanto a página estiver aberta.'}
          </span>
        </div>
      </form>
    </section>
  );
}
