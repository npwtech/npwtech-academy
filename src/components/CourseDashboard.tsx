import { useState } from 'react';
import { ArrowRight, Check, Circle, RotateCcw, Settings2, Flag } from 'lucide-react';
import { COURSE, MODULES, getModule } from '../data/course';
import { isModuleComplete, useProgress } from '../state/progress';
import { RobotPresenter } from './RobotPresenter';
import { ProgressRing, StepChips, Switch } from './ProgressIndicator';
import '../styles/dashboard.css';

export function CourseDashboard({ onOpenSettings }: { onOpenSettings: () => void }) {
  const p = useProgress();
  const { summary, state } = p;
  const [nameDraft, setNameDraft] = useState(state.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const last = state.lastModule ? getModule(state.lastModule) : undefined;
  const continueTo = last && !isModuleComplete(state.modules[last.id]) ? last : summary.nextModule;
  const started = Object.keys(state.modules).length > 0 || !!state.lastModule;

  const pending: { id: string; text: string; href: string }[] = [];
  for (const m of MODULES) {
    const mp = p.get(m.id);
    if (!mp.contentDone && !mp.exerciseDone && !mp.quizDone) continue;
    if (!mp.contentDone) pending.push({ id: `${m.id}-c`, text: `Concluir a aula do módulo ${m.number}`, href: `#${m.id}` });
    if (!mp.exerciseDone) pending.push({ id: `${m.id}-e`, text: `Exercício do módulo ${m.number}`, href: `#${m.id}-exercicio` });
    if (!mp.quizDone) pending.push({ id: `${m.id}-q`, text: `Quiz do módulo ${m.number}`, href: `#${m.id}-quiz` });
  }
  const greeting = state.name.trim() ? `Olá, ${state.name.trim()}!` : 'Olá! Que bom ter você aqui.';

  return (
    <div className="dash">
      <section className="dash-top tech-grid" aria-labelledby="dash-title">
        <div className="wrap dash-top__grid">
          <div className="welcome enter">
            <div className="welcome__avatar">
              <RobotPresenter state="idle" variant="avatar" showStatus={false} />
            </div>
            <div className="welcome__text">
              <p className="tag">Meu painel · {COURSE.title}</p>
              <h1 id="dash-title">{greeting}</h1>
              <p>
                {summary.allDone
                  ? 'Você concluiu todos os módulos. Revise quando quiser e confira a mensagem final do curso.'
                  : started
                    ? 'Continue de onde parou. Cada módulo tem uma aula narrada, um exercício e um quiz.'
                    : 'Eu sou o robô da NPWTech e vou apresentar as aulas. Comece pelo módulo 1 e avance no seu ritmo.'}
              </p>
              <form
                className="welcome__name"
                onSubmit={(e) => {
                  e.preventDefault();
                  p.setName(nameDraft.trim().slice(0, 40));
                }}
              >
                <label htmlFor="student-name" className="sr-only">
                  Como prefere ser chamado?
                </label>
                <input
                  id="student-name"
                  className="input"
                  placeholder="Como prefere ser chamado?"
                  value={nameDraft}
                  maxLength={40}
                  onChange={(e) => setNameDraft(e.target.value)}
                  autoComplete="given-name"
                />
                <button className="btn btn-sm" type="submit" disabled={nameDraft.trim() === state.name.trim()}>
                  Salvar nome
                </button>
              </form>
            </div>
          </div>

          <div className="overview enter enter-1">
            <ProgressRing percent={summary.percent} />
            <div className="overview__text">
              <p className="tag">Progresso geral</p>
              <p className="overview__count">
                <strong>{summary.completedModules}</strong> de {summary.totalModules} módulos concluídos
              </p>
              {last && (
                <p className="overview__last">
                  Última aula acessada: <span>Módulo {last.number} — {last.title}</span>
                </p>
              )}
              {summary.allDone ? (
                <a className="btn btn-primary" href="#conclusao">
                  Ver conclusão do curso <ArrowRight />
                </a>
              ) : (
                <a className="btn btn-primary" href={`#${continueTo.id}`}>
                  {started ? 'Continuar aprendendo' : 'Começar pelo módulo 1'} <ArrowRight />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap dash-body">
        <section className="dash-modules" aria-labelledby="mods-title">
          <h2 id="mods-title" className="dash-h2">
            Módulos
          </h2>
          <ol className="mod-list">
            {MODULES.map((m) => {
              const mp = p.get(m.id);
              const done = isModuleComplete(mp);
              const startedM = mp.contentDone || mp.exerciseDone || mp.quizDone || state.lastModule === m.id;
              const status = done ? 'Concluído' : startedM ? 'Em andamento' : 'Não iniciado';
              return (
                <li key={m.id} className="mod-row" data-done={done || undefined}>
                  <a href={`#${m.id}`} className="mod-row__link">
                    <span className="mod-row__num" aria-hidden="true">
                      {done ? <Check /> : String(m.number).padStart(2, '0')}
                    </span>
                    <span className="mod-row__main">
                      <span className="mod-row__title">
                        <span className="sr-only">Módulo {m.number}: </span>
                        {m.title}
                      </span>
                      <span className="mod-row__meta">
                        {m.lessonLabel} · {m.duration}
                      </span>
                      <StepChips p={mp} compact />
                    </span>
                    <span className={`pill pill--${done ? 'done' : startedM ? 'active' : 'idle'}`}>{status}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="dash-side" aria-label="Atividades e configurações">
          <section className="side-card" aria-labelledby="pending-title">
            <h2 id="pending-title" className="side-card__title">
              Atividades pendentes
            </h2>
            {pending.length === 0 ? (
              <p className="side-card__empty">
                {started
                  ? summary.allDone
                    ? 'Nenhuma pendência. Você fez tudo!'
                    : 'Nenhuma pendência nos módulos iniciados. Siga para o próximo módulo.'
                  : 'As atividades aparecem aqui quando você começar um módulo.'}
              </p>
            ) : (
              <ul className="todo">
                {pending.slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <Circle aria-hidden="true" />
                    <a href={t.href}>{t.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="side-card" aria-labelledby="check-title">
            <h2 id="check-title" className="side-card__title">
              Checklist de conclusão
            </h2>
            <ul className="checklist">
              {MODULES.map((m) => {
                const done = isModuleComplete(p.get(m.id));
                return (
                  <li key={m.id} data-done={done || undefined}>
                    <span className="checklist__box" aria-hidden="true">
                      {done && <Check />}
                    </span>
                    <span>
                      Módulo {m.number}
                      <span className="sr-only">{done ? ' concluído' : ' pendente'}</span>
                    </span>
                  </li>
                );
              })}
              <li data-done={summary.allDone || undefined}>
                <span className="checklist__box" aria-hidden="true">
                  {summary.allDone ? <Check /> : <Flag />}
                </span>
                {summary.allDone ? <a href="#conclusao">Conclusão do curso</a> : <span>Conclusão do curso</span>}
              </li>
            </ul>
            <p className="side-card__hint">Um módulo é concluído quando você termina a aula e responde ao quiz.</p>
          </section>

          <section className="side-card" aria-labelledby="quick-title">
            <h2 id="quick-title" className="side-card__title">
              Áudio e acessibilidade
            </h2>
            <div className="quick">
              <Switch
                id="quick-narration"
                label="Narração do robô"
                checked={state.settings.narration}
                onChange={(v) => p.updateSettings({ narration: v })}
              />
              <Switch
                id="quick-large"
                label="Texto maior"
                checked={state.settings.largeText}
                onChange={(v) => p.updateSettings({ largeText: v })}
              />
              <button type="button" className="btn btn-sm" onClick={onOpenSettings}>
                <Settings2 />
                Voz, velocidade e mais
              </button>
            </div>
          </section>

          <section className="side-card side-card--quiet" aria-labelledby="data-title">
            <h2 id="data-title" className="side-card__title">
              Seus dados
            </h2>
            <p className="side-card__hint">
              {p.storageAvailable
                ? 'O progresso e as respostas ficam salvos somente neste navegador, neste dispositivo. Não há conta nem sincronização.'
                : 'Este navegador não permite salvar dados. Seu progresso vale apenas enquanto a página estiver aberta.'}
            </p>
            {!confirmReset ? (
              <button type="button" className="btn btn-sm btn-ghost reset-btn" onClick={() => setConfirmReset(true)}>
                <RotateCcw />
                Reiniciar progresso
              </button>
            ) : (
              <div className="confirm" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
                <p id="confirm-title">
                  <strong>Reiniciar todo o progresso?</strong>
                </p>
                <p id="confirm-desc">Aulas concluídas, respostas dos exercícios e notas dos quizzes serão apagadas.</p>
                <div className="confirm__actions">
                  <button type="button" className="btn btn-sm" onClick={() => setConfirmReset(false)} autoFocus>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      p.reset();
                      setNameDraft('');
                      setConfirmReset(false);
                    }}
                  >
                    Sim, reiniciar
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
