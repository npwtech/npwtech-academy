import { BookOpen } from 'lucide-react';
import { ASSETS } from '../assets';
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

export function AppHeader({ route }: { route: Route }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Brand />
        <nav className="app-header__nav" aria-label="Navegação principal">
          <a href="#sumario" className="app-header__hide-sm">
            Sumário
          </a>
          <a href="#duvidas" className="app-header__hide-sm">
            Dúvidas
          </a>
          <a href="#ebook" className="app-header__hide-sm">
            Ebook
          </a>
          <a href="#biblioteca" className="app-header__library" aria-current={route.name === 'biblioteca' ? 'page' : undefined}>
            <BookOpen aria-hidden="true" />
            Minha biblioteca
          </a>
        </nav>
      </div>
    </header>
  );
}
