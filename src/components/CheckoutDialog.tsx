import { ArrowRight, BookOpen, Loader2, LockKeyhole, MailCheck, ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BRAND, EBOOK } from '../data/ebook';
import { supabaseConfigured } from '../lib/supabase';
import { isValidEmail, normalizeEmail, useAuth } from '../state/auth';
import { startCheckout } from '../state/library';
import { go } from '../state/router';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'email' | 'code' | 'confirm' | 'redirecting';

function authMessage(err: unknown): string {
  const status = (err as { status?: number })?.status;
  const msg = String((err as Error)?.message ?? '').toLowerCase();
  if (status === 429 || msg.includes('rate')) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  if (msg.includes('expired') || msg.includes('invalid') || msg.includes('token')) return 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.';
  return 'Não foi possível continuar agora. Verifique sua conexão e tente de novo.';
}

export function CheckoutDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const auth = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setError(null);
      setCode('');
      setStep(auth.session ? 'confirm' : 'email');
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open, auth.session]);

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError('Digite um e-mail válido.');
    setBusy(true);
    setError(null);
    try {
      await auth.sendCode(email);
      setStep('code');
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) return setError('O código tem 6 números.');
    setBusy(true);
    setError(null);
    try {
      await auth.verifyCode(email, code);
      await pay();
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  };

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await startCheckout();
      if (result.kind === 'owned') {
        onClose();
        go('#biblioteca');
        return;
      }
      setStep('redirecting');
      window.location.assign(result.url);
    } catch {
      setStep('confirm');
      setError('Não conseguimos abrir o pagamento agora. Tente de novo em instantes.');
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className="dialog checkout" aria-labelledby="checkout-title" onClose={onClose}>
      <div className="dialog__head">
        <h2 id="checkout-title">Comprar o ebook</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
          <X />
        </button>
      </div>

      <div className="dialog__body">
        <div className="checkout__product">
          <span className="checkout__thumb" aria-hidden="true">
            <BookOpen />
          </span>
          <div>
            <strong>{EBOOK.title}</strong>
            <span>Ebook · acesso imediato e vitalício</span>
          </div>
          <span className="checkout__price">{EBOOK.priceLabel}</span>
        </div>

        {!supabaseConfigured ? (
          <div className="notice">
            <LockKeyhole aria-hidden="true" />
            <p>
              As vendas on-line estão sendo ativadas. Enquanto isso, garanta o seu exemplar pelo WhatsApp{' '}
              <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer">
                {BRAND.whatsappLabel}
              </a>
              .
            </p>
          </div>
        ) : step === 'email' ? (
          <form className="checkout__form" onSubmit={submitEmail} noValidate>
            <ol className="checkout__steps" aria-label="Etapas">
              <li data-active>E-mail</li>
              <li>Código</li>
              <li>Pagamento</li>
            </ol>
            <div className="field">
              <label htmlFor="checkout-email">Seu melhor e-mail</label>
              <input
                id="checkout-email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby="checkout-email-help"
              />
              <small id="checkout-email-help" className="dialog__note">
                O livro fica ligado a este e-mail. É com ele que você entra para ler em qualquer aparelho.
              </small>
            </div>
            {error && <p className="error-text" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <Loader2 className="spin" /> : <MailCheck />}
              Receber código de acesso
            </button>
          </form>
        ) : step === 'code' ? (
          <form className="checkout__form" onSubmit={submitCode} noValidate>
            <ol className="checkout__steps" aria-label="Etapas">
              <li data-done>E-mail</li>
              <li data-active>Código</li>
              <li>Pagamento</li>
            </ol>
            <div className="field">
              <label htmlFor="checkout-code">Código enviado para {normalizeEmail(email)}</label>
              <input
                id="checkout-code"
                className="input checkout__code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <small className="dialog__note">
                Não chegou? Confira o spam ou{' '}
                <button type="button" className="link-btn" onClick={() => setStep('email')}>
                  use outro e-mail
                </button>
                .
              </small>
            </div>
            {error && <p className="error-text" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <Loader2 className="spin" /> : <ArrowRight />}
              Confirmar e ir para o pagamento
            </button>
          </form>
        ) : (
          <div className="checkout__form">
            <ol className="checkout__steps" aria-label="Etapas">
              <li data-done>E-mail</li>
              <li data-done>Código</li>
              <li data-active>Pagamento</li>
            </ol>
            <p className="dialog__note">
              Comprando como <strong>{auth.email}</strong>.
            </p>
            {error && <p className="error-text" role="alert">{error}</p>}
            <button type="button" className="btn btn-primary" onClick={pay} disabled={busy || step === 'redirecting'}>
              {busy || step === 'redirecting' ? <Loader2 className="spin" /> : <ArrowRight />}
              {step === 'redirecting' ? 'Abrindo o Mercado Pago…' : `Pagar ${EBOOK.priceLabel} com PIX ou cartão`}
            </button>
          </div>
        )}

        <p className="checkout__trust">
          <ShieldCheck aria-hidden="true" />
          Pagamento processado pelo Mercado Pago. Este site não recebe os dados do seu cartão. 7 dias para desistir, conforme o
          Código de Defesa do Consumidor.
        </p>
      </div>
    </dialog>
  );
}
