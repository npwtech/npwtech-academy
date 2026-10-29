# NPWTech Academy — Ebook "Sua Empresa no Digital"

Página de vendas e leitor on-line do ebook **Sua Empresa no Digital**, da NPWTech.

- Landing page em rolagem: abertura, problema, jornada do cliente, sumário, "por dentro do livro" e a **vitrine do livro em 3D**.
- Clicar no livro abre uma **prévia gratuita** de uma página do Capítulo 1.
- Compra por **R$ 55** via Mercado Pago (PIX, cartão em até 3×).
- Depois do pagamento, o livro é liberado na **Minha biblioteca**, com login sem senha (código por e-mail) em qualquer aparelho.

Feita com React 18 + TypeScript + Vite, Supabase (Auth, Postgres com RLS e Edge Functions) e Mercado Pago Checkout Pro.

## Como a segurança funciona

| Camada | O que protege |
|---|---|
| Conteúdo fora do site | O texto completo dos capítulos está **só no banco**. O arquivo que o carrega (`supabase/migrations/…_ebook_content.sql`) **não é versionado**: este repositório é público. O código publicado contém apenas a página de prévia. |
| RLS no Postgres | A tabela `ebook_chapters` só devolve linhas para quem tem um pedido com `status = 'paid'`. Pedidos só podem ser lidos pelo próprio dono e **nunca** escritos pelo navegador. |
| Preço no servidor | A Edge Function `create-checkout` lê o preço da tabela `products`. O navegador não envia valor. |
| Webhook assinado | `mp-webhook` valida a assinatura `x-signature` (HMAC-SHA256) e a idade da notificação, depois **consulta o pagamento direto na API do Mercado Pago**. Só libera se valor, moeda e pedido conferirem. Estornos e chargebacks revogam o acesso. |
| Login sem senha | Código de 6 dígitos pelo Supabase Auth. O livro fica ligado ao e-mail verificado. |
| Navegador | CSP restritiva na versão publicada, redirecionamento aceito só para domínios do Mercado Pago, conteúdo renderizado como React (nunca HTML cru), CORS das funções limitado ao domínio do site. |
| Abuso e robôs | Limites de pedidos, de consultas e de envio de códigos, webhook que ignora chamadas sem assinatura e CAPTCHA recomendado. |
| Dissuasão de cópia | Marca d'água com o e-mail do comprador, cópia/menu de contexto desativados no texto e impressão bloqueada. *Isso desestimula, mas não impede, quem está decidido a copiar o que vê na tela.* |

Detalhes, modelo de ameaças e checklist de produção: [SECURITY.md](SECURITY.md).

## Ativação (uma vez)

Pré-requisitos: [Node.js](https://nodejs.org) 18+, uma conta no [Supabase](https://supabase.com), uma conta no [Mercado Pago](https://www.mercadopago.com.br/developers) e a [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

1. **Banco e funções**. Antes do `db push`, coloque o arquivo do conteúdo do livro (`20261029120100_ebook_content.sql`, guardado fora do repositório) na pasta `supabase/migrations/`. O `.gitignore` impede que ele seja enviado ao GitHub.
   ```cmd
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   supabase db push
   supabase functions deploy create-checkout
   supabase functions deploy sync-order
   supabase functions deploy mp-webhook --no-verify-jwt
   ```
2. **Segredos das funções** (nunca vão para o código):
   ```cmd
   supabase secrets set MP_ACCESS_TOKEN=APP_USR-...
   supabase secrets set MP_WEBHOOK_SECRET=...
   supabase secrets set SITE_URL=https://academy.npwtech.com.br
   supabase secrets set ALLOWED_ORIGINS=https://academy.npwtech.com.br
   ```
3. **Webhook no Mercado Pago** → Suas integrações → sua aplicação → Webhooks:
   URL `https://SEU_PROJECT_REF.supabase.co/functions/v1/mp-webhook`, evento **Pagamentos**. Copie a *assinatura secreta* para `MP_WEBHOOK_SECRET`.
4. **E-mail com código** → Supabase → Authentication → Email Templates → *Magic Link*: inclua `{{ .Token }}` no texto, por exemplo
   `Seu código de acesso ao ebook NPWTech é {{ .Token }}`. Para produção, configure um SMTP próprio (Authentication → SMTP), porque o envio padrão do Supabase tem limite baixo por hora.
5. **Site**: copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

Sem o `.env`, o site funciona normalmente e o botão de compra indica o WhatsApp.

## Rodar e publicar

```cmd
npm install
npm run dev        :: desenvolvimento em http://localhost:5173
npm run build      :: gera a pasta dist\ para publicar
```

Publique a pasta `dist\` em qualquer hospedagem estática com HTTPS (Netlify, Vercel, Cloudflare Pages, Hostinger…).
Os cabeçalhos de segurança já vão junto no build: `public/_headers` (Netlify/Cloudflare Pages) e `public/.htaccess` (Hostinger/cPanel, com HTTPS forçado). A CSP da página usa a URL exata do Supabase definida no `.env`, então gere o build com o `.env` preenchido.

## Alterar preço ou conteúdo

- **Preço cobrado**: `update public.products set price_cents = 5500 where id = 'ebook-sua-empresa-no-digital';` e ajuste o texto exibido em `src/data/ebook.ts` (`EBOOK.price`).
- **Conteúdo do livro**: edite os blocos em uma nova migração (`update public.ebook_chapters set blocks = … where slug = …`). Os tipos de bloco estão em `src/data/ebook.ts` (tipo `Block`). Guarde o arquivo de conteúdo em local seguro: ele não fica no repositório.
- **Vitrine, sumário, prévia e FAQ**: `src/data/ebook.ts`.

## Estrutura

```
src/
├─ data/ebook.ts             vitrine, sumário, prévia pública e perguntas frequentes
├─ lib/supabase.ts           cliente público (chave anon)
├─ state/
│  ├─ auth.tsx               login sem senha por código no e-mail
│  ├─ library.ts             compra, confirmação de pagamento e capítulos
│  └─ router.ts              #inicio, #ebook, #biblioteca, #biblioteca/<capitulo>
├─ hooks/useScroll.ts        revelação ao rolar e animações ligadas à rolagem
├─ components/
│  ├─ Landing                página de vendas
│  ├─ EbookCover             livro em 3D (só CSS)
│  ├─ PagePreview            prévia: o livro se abre em uma página
│  ├─ CheckoutDialog         e-mail → código → Mercado Pago
│  ├─ Library                biblioteca e confirmação de compra
│  ├─ EbookReader            leitor com sumário, tamanho de texto e marca d'água
│  └─ EbookBlocks            renderização segura dos blocos do livro
└─ styles/                   tokens do Design System e CSS por área
supabase/
├─ migrations/               tabelas, RLS e conteúdo do livro
└─ functions/                create-checkout, sync-order, mp-webhook
```

## Direito de arrependimento

O site informa os 7 dias de desistência previstos no art. 49 do Código de Defesa do Consumidor. O estorno é feito pelo painel do Mercado Pago; o webhook revoga o acesso automaticamente quando o pagamento é estornado.
