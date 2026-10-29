# Segurança — NPWTech Academy (loja do ebook)

Este documento descreve como a loja protege o conteúdo pago, os pagamentos e os dados dos compradores, e o que precisa ser configurado antes de abrir as vendas.

## Modelo de ameaças

| Ameaça | Proteção |
|---|---|
| Ler o livro sem pagar | O texto completo não está no código do site nem neste repositório público. Fica só no banco, na tabela `ebook_chapters`, que o RLS libera apenas para quem tem pedido `paid`. O papel `anon` não tem privilégio de leitura. |
| Pagar menos que o preço | O valor é lido da tabela `products` pela Edge Function `create-checkout`. O navegador não envia preço. Na confirmação, valor e moeda do pagamento precisam bater com o pedido gravado. |
| Forjar a confirmação de pagamento | O webhook valida a assinatura `x-signature` (HMAC-SHA256 com `MP_WEBHOOK_SECRET`), recusa notificações com mais de 15 minutos e **consulta o pagamento direto na API do Mercado Pago**. O corpo da notificação nunca é usado como prova. |
| Reenviar uma notificação antiga | Janela de 15 minutos na assinatura e atualização idempotente (`status = 'pending'` → `paid` uma única vez; `mp_payment_id` único). |
| Liberar acesso para outra conta | Pedidos ficam ligados ao `user_id` do token verificado. O cliente só lê os próprios pedidos e não consegue inserir, alterar nem apagar nenhum. |
| Estorno ou chargeback mantendo o acesso | O webhook muda o pedido para `refunded` e o RLS corta o acesso na hora. |
| Pagamento duplicado | Índice único de um pedido pago por pessoa e produto. O segundo pagamento é registrado no log para estorno manual, sem travar o webhook. |
| Abuso das funções | `create-checkout`: máximo de 10 pedidos por hora por conta, reaproveitando pedidos pendentes. `sync-order`: só pedidos das últimas 48 h, no máximo 1 consulta a cada 3 s por conta. Webhook: recusa corpos acima de 16 KB e não grava nada sem assinatura válida. |
| Robôs disparando códigos de login | Limites do Supabase Auth em `supabase/config.toml` (30 e-mails/h, 30 verificações a cada 5 min por IP, novo código só após 60 s, validade de 10 min). CAPTCHA (Cloudflare Turnstile) recomendado em produção. |
| XSS / injeção de script | Conteúdo renderizado como componentes React (sem `dangerouslySetInnerHTML`), CSP `script-src 'self'`, `object-src 'none'`, `frame-src 'none'`, conexões só com o projeto Supabase configurado. |
| Clickjacking | `X-Frame-Options: DENY` e `frame-ancestors 'none'` (`public/_headers` e `public/.htaccess`). |
| Redirecionamento malicioso no checkout | O site só redireciona para domínios `mercadopago.com` / `mercadopago.com.br` via HTTPS. |
| Vazamento de segredos | Nenhum segredo no código. O site usa só a chave pública `anon`. `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` e a `service_role` ficam nos segredos das Edge Functions. `.env` é ignorado pelo git. |
| CORS | As funções só respondem com `Access-Control-Allow-Origin` para os domínios listados em `ALLOWED_ORIGINS`. Sem configuração, nenhuma origem é aceita. |
| Redistribuição do livro por compradores | Marca d'água com o e-mail no leitor, cópia, menu de contexto e impressão bloqueados no texto. **Isso só desestimula**: quem pode ler na tela sempre pode fotografar. |
| Dependências vulneráveis | `npm audit` sem vulnerabilidades (Vite 7). Rode `npm audit` antes de cada publicação. |

## Checklist antes de abrir as vendas

- [ ] `supabase db push` aplicou as três migrações (loja, conteúdo e endurecimento).
- [ ] O arquivo `supabase/migrations/*_ebook_content.sql` **não** está no git (`git status` não deve listá-lo).
- [ ] Segredos configurados: `MP_ACCESS_TOKEN` (produção), `MP_WEBHOOK_SECRET`, `SITE_URL`, `ALLOWED_ORIGINS`.
- [ ] Webhook do Mercado Pago apontando para `/functions/v1/mp-webhook`, evento **Pagamentos**, com a assinatura secreta copiada.
- [ ] `mp-webhook` publicado com `--no-verify-jwt` e as outras duas funções **com** verificação de JWT.
- [ ] Modelo de e-mail com `{{ .Token }}` e SMTP próprio configurado (o padrão do Supabase envia poucos e-mails por hora).
- [ ] CAPTCHA (Turnstile) ativado no Supabase Auth.
- [ ] Em Supabase → Advisors → Security, nenhum alerta pendente.
- [ ] Site publicado só em HTTPS, com `_headers` (Netlify/Cloudflare) ou `.htaccess` (Hostinger) ativo.
- [ ] Teste ponta a ponta com um pagamento real de baixo valor e um estorno: o acesso precisa ser liberado e depois cortado.

## Como reportar um problema

Encontrou uma falha? Fale com a NPWTech pelo WhatsApp (21) 97008-9039 ou pelo site npwtech.com.br. Não abra uma issue pública com detalhes da falha.
