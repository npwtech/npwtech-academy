import { Check, Pause, Volume2, AlertCircle } from 'lucide-react';
import { ASSETS } from '../assets';
import '../styles/robot.css';

export type RobotState = 'idle' | 'speaking' | 'paused' | 'done' | 'error';

interface Props {
  state: RobotState;
  variant?: 'hero' | 'stage' | 'avatar';
  showStatus?: boolean;
  label?: string;
}

const STATUS_TEXT: Record<RobotState, string> = {
  idle: 'Pronto para apresentar',
  speaking: 'Falando',
  paused: 'Narração pausada',
  done: 'Fala concluída',
  error: 'Áudio indisponível',
};

/**
 * Professor virtual da NPWTech.
 * As animações (flutuação, respiração, inclinação e brilho) são aplicadas em camadas
 * ao redor da imagem original, sem deformar o rosto, o corpo ou o logo do peito.
 */
export function RobotPresenter({ state, variant = 'stage', showStatus = true, label }: Props) {
  return (
    <figure className={`robot robot--${variant}`} data-state={state}>
      <div className="robot__halo" aria-hidden="true" />
      <div className="robot__smoke" aria-hidden="true" />
      <div className="robot__float">
        <div className="robot__body">
          <img src={ASSETS.robot} alt={variant === 'avatar' ? 'Robô da NPWTech' : ASSETS.robotAlt} draggable={false} />
          <span className="robot__glow" aria-hidden="true" />
        </div>
      </div>
      {showStatus && (
        <figcaption className="robot__status" aria-live="polite">
          <span className="robot__indicator" aria-hidden="true">
            {state === 'done' ? (
              <Check />
            ) : state === 'paused' ? (
              <Pause />
            ) : state === 'error' ? (
              <AlertCircle />
            ) : state === 'idle' ? (
              <Volume2 />
            ) : (
              <span className="robot__bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            )}
          </span>
          <span>{label ?? STATUS_TEXT[state]}</span>
        </figcaption>
      )}
    </figure>
  );
}
