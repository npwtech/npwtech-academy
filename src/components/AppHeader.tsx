import { Settings2 } from 'lucide-react';
import { ASSETS } from '../assets';
import { COURSE } from '../data/course';
import type { Route } from '../state/router';
import '../styles/layout.css';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand" href="#inicio" aria-label="NPWTech Academy — página inicial">
      <img className="brand__mark" src={ASSETS.logoMark} alt="" width={30} height={33} />
      <span className="brand__text">
        <span className="brand__name">NPWTech</span>
        {!compact && <span className="brand__sub">Academy</span>}
      </span>
    </a>
  );
}

export function AppHeader({ route, onOpenSettings }: { route: Route; onOpenSettings: () => void }) {
  const inCourse = route.name === 'modulo' || route.name === 'painel' || route.name === 'conclusao';
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Brand />
        {inCourse && (
          <p className="app-header__course">
            <span className="tag">Curso</span>
            <span>{COURSE.title}</span>
          </p>
        )}
        <nav className="app-header__nav" aria-label="Navegação principal">
          <a href="#inicio" aria-current={route.name === 'inicio' ? 'page' : undefined}>
            Início
          </a>
          <a href="#painel" aria-current={route.name === 'painel' ? 'page' : undefined}>
            Meu painel
          </a>
          <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Configurações de áudio e acessibilidade">
            <Settings2 />
          </button>
        </nav>
      </div>
    </header>
  );
}
