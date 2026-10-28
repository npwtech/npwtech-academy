import { COURSE } from '../data/course';
import { useProgress } from '../state/progress';
import { Brand } from './AppHeader';

export function SiteFooter() {
  const { storageAvailable } = useProgress();
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__brand">
          <Brand />
          <p>{COURSE.company}</p>
        </div>
        <dl className="site-footer__contacts">
          <div>
            <dt className="tag">Site</dt>
            <dd>
              <a href={COURSE.site} target="_blank" rel="noopener noreferrer">
                {COURSE.siteLabel}
              </a>
            </dd>
          </div>
          <div>
            <dt className="tag">WhatsApp</dt>
            <dd>
              <a href={COURSE.whatsapp} target="_blank" rel="noopener noreferrer">
                {COURSE.whatsappLabel}
              </a>
            </dd>
          </div>
        </dl>
        <p className="site-footer__note">
          {storageAvailable
            ? 'Seu progresso fica salvo apenas neste navegador, neste dispositivo.'
            : 'Este navegador não permite salvar o progresso. As respostas valem somente enquanto a página estiver aberta.'}
        </p>
      </div>
    </footer>
  );
}
