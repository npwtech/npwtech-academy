import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { PRODUCT_ID, type Chapter } from '../data/ebook';
import { useAuth } from './auth';

export type Ownership = 'unconfigured' | 'loading' | 'signed-out' | 'owned' | 'not-owned' | 'error';

/** Diz se o usuário logado já comprou o livro (lê só os próprios pedidos, via RLS). */
export function useOwnership() {
  const { ready, session } = useAuth();
  const [state, setState] = useState<Ownership>(supabaseConfigured ? 'loading' : 'unconfigured');
  const userId = session?.user.id;

  const refresh = useCallback(async () => {
    if (!supabase) return setState('unconfigured');
    if (!userId) return setState('signed-out');
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('product_id', PRODUCT_ID)
      .eq('status', 'paid')
      .limit(1);
    if (error) return setState('error');
    setState(data.length > 0 ? 'owned' : 'not-owned');
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  return { ownership: state, refresh };
}

// Só aceita redirecionar para o próprio Mercado Pago (evita redirecionamento aberto).
function isMercadoPagoUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && /(^|\.)mercadopago\.com(\.br)?$/.test(u.hostname);
  } catch {
    return false;
  }
}

export type CheckoutResult = { kind: 'owned' } | { kind: 'redirect'; url: string };

export async function startCheckout(): Promise<CheckoutResult> {
  if (!supabase) throw new Error('not_configured');
  const { data, error } = await supabase.functions.invoke<{ owned?: boolean; checkoutUrl?: string; error?: string }>(
    'create-checkout',
    { body: {} },
  );
  if (error || !data) throw new Error(data?.error ?? 'checkout_failed');
  if (data.owned) return { kind: 'owned' };
  if (!data.checkoutUrl || !isMercadoPagoUrl(data.checkoutUrl)) throw new Error('checkout_failed');
  return { kind: 'redirect', url: data.checkoutUrl };
}

export type SyncStatus = 'paid' | 'processing' | 'pending' | 'none';

export async function syncOrder(): Promise<SyncStatus> {
  if (!supabase) throw new Error('not_configured');
  const { data, error } = await supabase.functions.invoke<{ status: SyncStatus }>('sync-order', { body: {} });
  if (error || !data) throw new Error('sync_failed');
  return data.status;
}

/** Carrega os capítulos completos. O banco só devolve conteúdo para quem comprou. */
export function useChapters(enabled: boolean) {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !supabase) return;
    let alive = true;
    supabase
      .from('ebook_chapters')
      .select('id, slug, kicker, title, summary, minutes, blocks')
      .order('id')
      .then(({ data, error }) => {
        if (!alive) return;
        if (error || !data?.length) setFailed(true);
        else setChapters(data as Chapter[]);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { chapters, failed };
}
