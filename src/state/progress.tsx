import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MODULES, type CourseModule } from '../data/course';

// Progresso salvo somente neste navegador (localStorage). Não há conta nem sincronização.
const STORAGE_KEY = 'npwtech-academy:v1';

export interface QuizResult {
  answers: (number | null)[];
  score: number;
  total: number;
  attempts: number;
}

export interface ModuleProgress {
  contentDone: boolean;
  exercise: Record<string, string>;
  exerciseDone: boolean;
  quiz?: QuizResult;
  quizDone: boolean;
  updatedAt?: number;
}

export interface Settings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
  narration: boolean;
  captions: boolean;
  largeText: boolean;
  reduceMotion: boolean;
}

export interface ProgressState {
  name: string;
  lastModule: string | null;
  modules: Record<string, ModuleProgress>;
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  voiceURI: null,
  rate: 0.92,
  pitch: 0.85,
  narration: true,
  captions: true,
  largeText: false,
  reduceMotion: false,
};

const emptyModule = (): ModuleProgress => ({ contentDone: false, exercise: {}, exerciseDone: false, quizDone: false });

const initialState = (): ProgressState => ({ name: '', lastModule: null, modules: {}, settings: { ...DEFAULT_SETTINGS } });

function readStorage(): { state: ProgressState; available: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: initialState(), available: true };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      available: true,
      state: {
        ...initialState(),
        ...parsed,
        modules: parsed.modules ?? {},
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      },
    };
  } catch {
    return { state: initialState(), available: false };
  }
}

export function isModuleComplete(p?: ModuleProgress) {
  return !!p && p.contentDone && p.quizDone;
}

interface ProgressApi {
  state: ProgressState;
  storageAvailable: boolean;
  get: (id: string) => ModuleProgress;
  setName: (name: string) => void;
  visit: (id: string) => void;
  markContent: (id: string, done?: boolean) => void;
  saveExercise: (id: string, values: Record<string, string>, done?: boolean) => void;
  saveQuiz: (id: string, result: QuizResult | undefined, done: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  reset: () => void;
  summary: {
    completedModules: number;
    totalModules: number;
    percent: number;
    nextModule: CourseModule;
    allDone: boolean;
  };
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const first = useRef(readStorage());
  const [state, setState] = useState<ProgressState>(first.current.state);
  const [storageAvailable, setStorageAvailable] = useState(first.current.available);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageAvailable(false);
    }
  }, [state]);

  const patchModule = useCallback((id: string, fn: (m: ModuleProgress) => ModuleProgress) => {
    setState((s) => ({
      ...s,
      modules: { ...s.modules, [id]: { ...fn(s.modules[id] ?? emptyModule()), updatedAt: Date.now() } },
    }));
  }, []);

  const api = useMemo<ProgressApi>(() => {
    // Cada módulo vale 3 etapas: conteúdo, exercício e quiz.
    let units = 0;
    let completed = 0;
    for (const m of MODULES) {
      const p = state.modules[m.id];
      if (p?.contentDone) units++;
      if (p?.exerciseDone) units++;
      if (p?.quizDone) units++;
      if (isModuleComplete(p)) completed++;
    }
    const nextModule =
      MODULES.find((m) => !isModuleComplete(state.modules[m.id])) ??
      MODULES.find((m) => m.id === state.lastModule) ??
      MODULES[0];
    return {
      state,
      storageAvailable,
      get: (id) => state.modules[id] ?? emptyModule(),
      setName: (name) => setState((s) => ({ ...s, name })),
      visit: (id) => setState((s) => (s.lastModule === id ? s : { ...s, lastModule: id })),
      markContent: (id, done = true) => patchModule(id, (m) => ({ ...m, contentDone: done })),
      saveExercise: (id, values, done) =>
        patchModule(id, (m) => {
          const hasAny = Object.values(values).some((v) => v.trim());
          // done indefinido = rascunho: mantém a conclusão atual enquanto houver alguma resposta
          return { ...m, exercise: values, exerciseDone: done === undefined ? m.exerciseDone && hasAny : done };
        }),
      saveQuiz: (id, result, done) => patchModule(id, (m) => ({ ...m, quiz: result, quizDone: done })),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      reset: () => setState((s) => ({ ...initialState(), settings: s.settings })),
      summary: {
        completedModules: completed,
        totalModules: MODULES.length,
        percent: Math.round((units / (MODULES.length * 3)) * 100),
        nextModule,
        allDone: completed === MODULES.length,
      },
    };
  }, [state, storageAvailable, patchModule]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress precisa estar dentro de ProgressProvider');
  return ctx;
}
