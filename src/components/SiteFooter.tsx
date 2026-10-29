import { BRAND } from '../data/ebook';
import { Brand } from './AppHeader';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__brand">
          <Brand />
          <p>{BRAND.company}</p>
        </div>
        <dl className="site-footer__contacts">
          <div>
            <dt className="tag">Site</dt>
            <dd>
              <a href={BRAND.site} target="_blank" rel="noopener noreferrer">
                {BRAND.siteLabel}
              </a>
            </dd>
          </div>
          <div>
            <dt className="tag">WhatsApp</dt>
            <dd>
              <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer">
                {BRAND.whatsappLabel}
              </a>
            </dd>
          </div>
        </dl>
        <p className="site-footer__note">
          Pagamentos processados pelo Mercado Pago. O conteúdo do ebook é de uso pessoal e protegido por direitos autorais.
          © {new Date().getFullYear()} NPWTech.
        </p>
      </div>
    </footer>
  );
}
