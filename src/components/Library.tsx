import { ArrowRight, BookLock, Loader2, LockKeyhole, MailCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { BRAND, EBOOK } from '../data/ebook';
import { isValidEmail, normalizeEmail, useAuth } from '../state/auth';
import { syncOrder, useChapters, useOwnership } from '../state/library';
import { CheckoutDialog } from './CheckoutDialog';
import { EbookCover } from './EbookCover';
import { EbookReader } from './EbookReader';
import '../styles/library.css';

export const CHECKOUT_RETURN_KEY = 'npw:checkout-return';

// Fala do robô da capa, conforme a situação da compra.
function LibraryBubble({ text }: { text?: string }) {
  return text ? <p className="book-bubble library__bubble">{text}</p> : null;
}

function LoginPanel() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!sent && !isValidEmail(email)) return setError('Digite um e-mail válido.');
    if (sent && !/^\d{6}$/.test(code.trim())) return setError('O código tem 6 números.');
    setBusy(true);
    try {
      if (!sent) {
        await auth.sendCode(email);
        setSent(true);
      } else {
        await auth.verifyCode(email, code);
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setError(
        status === 429
          ? 'Muitas tentativas. Aguarde um minuto e tente de novo.'
          : sent
            ? 'Código inválido ou expirado.'
            : 'Não foi possível enviar o código agora.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="library-card__form" onSubmit={submit} noValidate>
      {!sent ? (
        <div className="field">
          <label htmlFor="login-email">E-mail usado na compra</label>
          <input
            id="login-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      ) : (
        <div className="field">
          <label htmlFor="login-code">Código enviado para {normalizeEmail(email)}</label>
          <input
            id="login-code"
            className="input checkout__code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <button type="button" className="link-btn" onClick={() => setSent(false)}>
            Usar outro e-mail
          </button>
        </div>
      )}
      {error && <p className="error-text" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? <Loader2 className="spin" /> : sent ? <ArrowRight /> : <MailCheck />}
        {sent ? 'Entrar' : 'Receber código de acesso'}
      </button>
    </form>
  );
}

export function Library({ chapter }: { chapter?: string }) {
  const auth = useAuth();
  const { ownership, refresh } = useOwnership();
  const { chapters, failed } = useChapters(ownership === 'owned');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmNote, setConfirmNote] = useState<string | null>(null);

  // Ao voltar do Mercado Pago, confirma o pagamento sem esperar o webhook.
  useEffect(() => {
    if (ownership !== 'not-owned') return;
    let pending = false;
    try {
      pending = sessionStorage.getItem(CHECKOUT_RETURN_KEY) === '1';
    } catch {
      // sem sessionStorage: o webhook libera o acesso normalmente
    }
    if (!pending) return;

    let alive = true;
    let tries = 0;
    setConfirming(true);
    const tick = async () => {
      tries++;
      try {
        const status = await syncOrder();
        if (!alive) return;
        if (status === 'paid') {
          sessionStorage.removeItem(CHECKOUT_RETURN_KEY);
          setConfirming(false);
          await refresh();
          return;
        }
        if (status === 'processing') setConfirmNote('Pagamento em análise. Assim que for aprovado, o livro aparece aqui automaticamente.');
      } catch {
        // tenta de novo no próximo ciclo
      }
      if (alive && tries < 12) window.setTimeout(tick, 4000);
      else if (alive) {
        setConfirming(false);
        setConfirmNote((n) => n ?? 'Ainda não recebemos a confirmação do pagamento. Se você pagou, atualize a página em alguns minutos.');
      }
    };
    void tick();
    return () => {
      alive = false;
    };
  }, [ownership, refresh]);

  if (ownership === 'owned') {
    if (chapters && auth.email) {
      return <EbookReader chapters={chapters} slug={chapter} email={auth.email} onSignOut={() => void auth.signOut()} />;
    }
    return (
      <section className="library wrap" aria-busy={!failed}>
        <div className="library-card">
          {failed ? (
            <p className="error-text" role="alert">
              Não foi possível carregar o livro. Verifique sua conexão e atualize a página.
            </p>
          ) : (
            <p className="library-card__loading">
              <Loader2 className="spin" /> Abrindo seu ebook…
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="library wrap" aria-labelledby="library-title">
      <div className="library__grid">
        <div className="library__book" aria-hidden="true">
          <EbookCover angle={-22} size="md" />
          <LibraryBubble
            text={
              confirming
                ? 'Tô confirmando com o Mercado Pago. Só um instante!'
                : ownership === 'signed-out'
                  ? 'Entra com seu e-mail que eu abro o livro pra você.'
                  : ownership === 'not-owned'
                    ? 'Seu exemplar está te esperando!'
                    : undefined
            }
          />
        </div>
        <div className="library-card">
          <p className="tag">Minha biblioteca</p>
          <h1 id="library-title">
            {ownership === 'signed-out' ? 'Entre para ler seu ebook' : confirming ? 'Confirmando seu pagamento' : EBOOK.title}
          </h1>

          {ownership === 'unconfigured' && (
            <div className="notice">
              <LockKeyhole aria-hidden="true" />
              <p>
                A biblioteca on-line está sendo ativada. Fale com a gente pelo WhatsApp{' '}
                <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer">
                  {BRAND.whatsappLabel}
                </a>
                .
              </p>
            </div>
          )}

          {(ownership === 'loading' || !auth.ready) && (
            <p className="library-card__loading">
              <Loader2 className="spin" /> Carregando…
            </p>
          )}

          {ownership === 'signed-out' && (
            <>
              <p className="library-card__lead">Sem senha: enviamos um código de 6 números para o seu e-mail.</p>
              <LoginPanel />
            </>
          )}

          {ownership === 'error' && (
            <p className="error-text" role="alert">
              Não foi possível verificar sua compra agora. Atualize a página em instantes.
            </p>
          )}

          {ownership === 'not-owned' && (
            <>
              {confirming ? (
                <p className="library-card__loading">
                  <Loader2 className="spin" /> Aguardando a confirmação do Mercado Pago. No PIX costuma levar poucos segundos.
                </p>
              ) : (
                <p className="library-card__lead">
                  <BookLock aria-hidden="true" /> A conta <strong>{auth.email}</strong> ainda não tem o ebook.
                </p>
              )}
              {confirmNote && <p className="dialog__note">{confirmNote}</p>}
              {!confirming && (
                <div className="library-card__actions">
                  <button type="button" className="btn btn-primary" onClick={() => setCheckoutOpen(true)}>
                    Comprar por {EBOOK.priceLabel}
                    <ArrowRight />
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => void auth.signOut()}>
                    Entrar com outro e-mail
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </section>
  );
}
