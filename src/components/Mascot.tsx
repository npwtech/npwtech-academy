import type { ReactNode } from 'react';
import { ASSETS } from '../assets';
import '../styles/mascot.css';

interface Props {
  /** hero: grande, ao lado do livro · peek: espia da borda de baixo · avatar: só o rosto, em círculo */
  variant?: 'hero' | 'peek' | 'avatar';
  /** Fala do robô em um balão. */
  says?: ReactNode;
  /** Lado do balão em relação ao robô. */
  side?: 'left' | 'right' | 'top';
  className?: string;
  decorative?: boolean;
}

// Mascote da NPWTech. Só imagem e animação: o robô não fala em voz alta.
export function Mascot({ variant = 'hero', says, side = 'left', className = '', decorative = true }: Props) {
  return (
    <figure className={`mascot mascot--${variant} ${className}`} data-side={side}>
      <span className="mascot__halo" aria-hidden="true" />
      <img
        className="mascot__img"
        src={ASSETS.robot}
        alt={decorative ? '' : ASSETS.robotAlt}
        width={900}
        height={871}
        loading={variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
      />
      {says && (
        <figcaption className="mascot__bubble">
          <span>{says}</span>
        </figcaption>
      )}
    </figure>
  );
}
