import { useEffect, useRef } from 'react';
import { Check, LayoutDashboard, X } from 'lucide-react';
import { MODULES } from '../data/course';
import { isModuleComplete, useProgress } from '../state/progress';
import { ProgressBar } from './ProgressIndicator';

interface Props {
  currentId: string;
  open: boolean;
  onClose: () => void;
}

export function CourseSidebar({ currentId, open, onClose }: Props) {
  const p = useProgress();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Menu em gaveta (telas menores): Esc fecha e o foco vai para o botão de fechar.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const currentIdx = MODULES.findIndex((m) => m.id === currentId);

  return (
    <>
      <div className="sidebar-scrim" data-open={open || undefined} onClick={onClose} aria-hidden="true" />
      <aside id="course-menu" className="sidebar" data-open={open || undefined} aria-label="Módulos do curso">
        <div className="sidebar__head">
          <div>
            <p className="tag">Progresso</p>
            <p className="sidebar__count">
              {p.summary.completedModules}/{p.summary.totalModules} módulos · {p.summary.percent}%
            </p>
          </div>
          <button ref={closeRef} type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Fechar menu de módulos">
            <X />
          </button>
        </div>
        <ProgressBar value={p.summary.percent / 100} label="Progresso do curso" />

        <nav aria-label="Aulas">
          <ol className="side-mods">
            {MODULES.map((m, i) => {
              const mp = p.get(m.id);
              const done = isModuleComplete(mp);
              const current = m.id === currentId;
              const state = current ? 'Aula atual' : done ? 'Concluída' : i === currentIdx + 1 ? 'Próxima' : '';
              return (
                <li key={m.id} data-current={current || undefined} data-done={done || undefined}>
                  <a href={`#${m.id}`} aria-current={current ? 'page' : undefined} onClick={onClose}>
                    <span className="side-mods__marker" aria-hidden="true">
                      {done ? <Check /> : m.number}
                    </span>
                    <span className="side-mods__text">
                      <span className="side-mods__label">
                        Módulo {m.number} · {m.lessonLabel}
                        {state && <em> · {state}</em>}
                      </span>
                      <span className="side-mods__title">{m.title}</span>
                    </span>
                  </a>
                  {current && (
                    <span className="side-mods__sub">
                      <a href={`#${m.id}-exercicio`} onClick={onClose}>
                        Exercício
                        <span>{mp.exerciseDone ? 'feito' : 'pendente'}</span>
                      </a>
                      <a href={`#${m.id}-quiz`} onClick={onClose}>
                        Quiz
                        <span>{mp.quizDone && mp.quiz ? `${mp.quiz.score}/${mp.quiz.total}` : 'pendente'}</span>
                      </a>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="sidebar__foot">
          <a className="btn btn-sm" href="#painel">
            <LayoutDashboard />
            Meu painel
          </a>
        </div>
      </aside>
    </>
  );
}
