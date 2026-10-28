import { Check } from 'lucide-react';
import type { ModuleProgress } from '../state/progress';

/** Anel de progresso geral (0–100). */
export function ProgressRing({ percent, size = 132 }: { percent: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${percent}% do curso concluído`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--white)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring__label" aria-hidden="true">
        <strong>{percent}</strong>
        <small>%</small>
      </span>
    </div>
  );
}

/** Barra linear simples. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <span style={{ transform: `scaleX(${v})` }} />
    </div>
  );
}

/** Etapas de um módulo: conteúdo, exercício e quiz, com texto e ícone (não depende só de cor). */
export function StepChips({ p, compact = false }: { p: ModuleProgress; compact?: boolean }) {
  const quizLabel = p.quizDone && p.quiz ? `Quiz ${p.quiz.score}/${p.quiz.total}` : 'Quiz';
  const steps = [
    { label: 'Aula', done: p.contentDone },
    { label: 'Exercício', done: p.exerciseDone },
    { label: quizLabel, done: p.quizDone },
  ];
  return (
    <ul className={`steps${compact ? ' steps--compact' : ''}`} aria-label="Etapas do módulo">
      {steps.map((s) => (
        <li key={s.label} data-done={s.done || undefined}>
          <span className="steps__dot" aria-hidden="true">
            {s.done && <Check />}
          </span>
          {s.label}
          <span className="sr-only">{s.done ? ' — concluído' : ' — pendente'}</span>
        </li>
      ))}
    </ul>
  );
}

export function Switch({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="switch-row">
      <span className="switch-row__text">
        <span id={`${id}-label`}>{label}</span>
        {hint && <small id={`${id}-hint`}>{hint}</small>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
        <span className="switch__state" aria-hidden="true">
          {checked ? 'Ligado' : 'Desligado'}
        </span>
      </button>
    </div>
  );
}
