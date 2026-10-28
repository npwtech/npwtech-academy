import { useEffect, useRef, useState } from 'react';
import { ProgressProvider, useProgress } from './state/progress';
import { SpeechProvider } from './state/speech';
import { useRoute } from './state/router';
import { getModule } from './data/course';
import { AppHeader } from './components/AppHeader';
import { Landing } from './components/Landing';
import { CourseDashboard } from './components/CourseDashboard';
import { LessonPlayer } from './components/LessonPlayer';
import { CourseCompletion } from './components/CourseCompletion';
import { SettingsDialog } from './components/SettingsDialog';
import { SiteFooter } from './components/SiteFooter';

function Shell() {
  const route = useRoute();
  const { state } = useProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Preferências de acessibilidade aplicadas no documento inteiro.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('text-large', state.settings.largeText);
    root.classList.toggle('motion-reduced', state.settings.reduceMotion);
  }, [state.settings.largeText, state.settings.reduceMotion]);

  // Ao trocar de tela: volta ao topo (ou à seção pedida) e move o foco para o conteúdo.
  const routeKey = route.name === 'modulo' ? route.id : route.name;
  const anchor = route.name === 'inicio' || route.name === 'modulo' ? route.anchor : undefined;
  useEffect(() => {
    if (anchor) {
      // aguarda a tela renderizar antes de rolar até a seção
      const t = window.setTimeout(() => {
        const el = document.getElementById(anchor);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el?.focus?.({ preventScroll: true });
      }, 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [routeKey, anchor]);

  const mod = route.name === 'modulo' ? getModule(route.id) : undefined;

  return (
    <>
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
        Pular para o conteúdo
      </a>
      <AppHeader route={route} onOpenSettings={() => setSettingsOpen(true)} />
      <main id="conteudo" ref={mainRef} tabIndex={-1} className="app-main">
        {route.name === 'inicio' && <Landing />}
        {route.name === 'painel' && <CourseDashboard onOpenSettings={() => setSettingsOpen(true)} />}
        {route.name === 'modulo' && mod && <LessonPlayer key={mod.id} mod={mod} onOpenSettings={() => setSettingsOpen(true)} />}
        {route.name === 'conclusao' && <CourseCompletion />}
      </main>
      {route.name !== 'modulo' && <SiteFooter />}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <SpeechProvider>
        <Shell />
      </SpeechProvider>
    </ProgressProvider>
  );
}
