// Dados públicos do ebook "Sua Empresa no Digital": vitrine, sumário, prévia e perguntas frequentes.
// O texto completo dos capítulos NÃO fica aqui: ele está no banco (supabase/migrations)
// e só é entregue a quem comprou.

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'steps'; items: { title: string; text: string }[] }
  | { t: 'quote'; text: string; cite?: string }
  | { t: 'callout'; tone: 'tip' | 'alert' | 'npw'; title: string; text: string }
  | { t: 'compare'; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { t: 'checklist'; id: string; title: string; items: string[] }
  | { t: 'exercise'; id: string; title: string; text: string; fields: { id: string; label: string; placeholder?: string }[] }
  | { t: 'divider' };

export interface Chapter {
  id: number;
  slug: string;
  kicker: string;
  title: string;
  summary: string;
  minutes: number;
  blocks: Block[];
}

export const PRODUCT_ID = 'ebook-sua-empresa-no-digital';

export const BRAND = {
  company: 'NPWTech — Soluções Digitais',
  site: 'https://npwtech.com.br',
  siteLabel: 'npwtech.com.br',
  whatsapp: 'https://wa.me/5521970089039',
  whatsappLabel: '(21) 97008-9039',
};

export const EBOOK = {
  title: 'Sua Empresa no Digital',
  subtitle: 'O guia prático para ser encontrado, transmitir confiança e conquistar clientes na internet.',
  edition: 'Edição 2026',
  author: 'NPWTech',
  price: 55,
  priceLabel: 'R$ 55',
  installments: 'ou em até 3× no cartão',
};

// Sumário público (os títulos são vitrine; o conteúdo fica protegido).
export const TOC: Pick<Chapter, 'kicker' | 'title' | 'summary' | 'minutes'>[] = [
  { kicker: 'Introdução', title: 'Antes de começar', summary: 'Para quem é este livro e como aproveitar cada capítulo.', minutes: 4 },
  { kicker: 'Capítulo 1', title: 'Por que sua empresa precisa estar na internet', summary: 'A jornada silenciosa do cliente e a diferença entre ser encontrado e ser escolhido.', minutes: 7 },
  { kicker: 'Capítulo 2', title: 'Como divulgar sua empresa de maneira estratégica', summary: 'Público ideal, conteúdo que mostra valor e comunicação profissional.', minutes: 9 },
  { kicker: 'Capítulo 3', title: 'O papel de um site profissional', summary: 'As páginas que seu negócio precisa e por que pensar primeiro no celular.', minutes: 9 },
  { kicker: 'Capítulo 4', title: 'Como ser encontrado no Google', summary: 'SEO sem mistério: palavras do cliente, boas práticas e presença local.', minutes: 9 },
  { kicker: 'Capítulo 5', title: 'Transformando visitas em oportunidades', summary: 'Contato fácil, chamadas para ação, provas reais e acompanhamento.', minutes: 8 },
  { kicker: 'Capítulo 6', title: 'O próximo passo para o crescimento digital', summary: 'Como avaliar sua presença e escolher as melhorias certas.', minutes: 6 },
  { kicker: 'Bônus', title: 'Seu plano de 30 dias', summary: 'Uma rotina semana a semana para tirar tudo do papel.', minutes: 6 },
];

export const TOTAL_MINUTES = TOC.reduce((s, c) => s + c.minutes, 0);

// Página de amostra exibida a qualquer visitante (Capítulo 1, primeira página).
export const PREVIEW: { kicker: string; title: string; page: number; blocks: Block[] } = {
  kicker: 'Capítulo 1',
  title: 'Por que sua empresa precisa estar na internet',
  page: 7,
  blocks: [
    {
      t: 'p',
      text: 'Pense na última vez em que você precisou de um serviço que nunca tinha contratado. Um eletricista, um restaurante novo, uma clínica. É bem provável que, antes de decidir, você tenha pegado o celular e pesquisado.',
    },
    {
      t: 'p',
      text: 'Seu cliente faz exatamente o mesmo. Hoje, muitos consumidores **pesquisam, comparam e procuram sinais de confiança** antes de contratar um serviço ou comprar um produto. Essa pesquisa acontece em segundos — e, muitas vezes, decide quem vai receber a mensagem pedindo orçamento.',
    },
    { t: 'h', text: 'A jornada silenciosa do cliente' },
    {
      t: 'p',
      text: 'A maior parte dessa jornada é invisível para você. O cliente não avisa que está pesquisando, não conta quantas empresas comparou e raramente explica por que escolheu outra.',
    },
  ],
};

export const INSIDE = [
  { title: '8 capítulos diretos ao ponto', text: 'Do porquê estar na internet até um plano de ação para os próximos 30 dias.' },
  { title: 'Exercícios aplicados', text: 'Perguntas práticas para responder pensando no seu negócio — com respostas salvas no navegador.' },
  { title: 'Checklists de diagnóstico', text: 'Marque o que já está pronto e veja exatamente o que falta melhorar.' },
  { title: 'Leitura em qualquer tela', text: 'Leitor próprio, confortável no celular e no computador, com ajuste de tamanho do texto.' },
];

export const FAQ = [
  {
    q: 'Como recebo o ebook depois de pagar?',
    a: 'Você entra com o seu e-mail antes de pagar. Assim que o Mercado Pago confirma o pagamento, o livro é liberado automaticamente na sua biblioteca, neste site. No PIX costuma levar poucos segundos.',
  },
  {
    q: 'Posso ler no celular?',
    a: 'Sim. O leitor foi feito para telas pequenas e grandes. Basta entrar com o mesmo e-mail em qualquer aparelho.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'PIX, cartão de crédito (em até 3 vezes) e as demais opções disponíveis no Mercado Pago. O pagamento acontece no ambiente seguro do Mercado Pago: este site não recebe os dados do seu cartão.',
  },
  {
    q: 'E se eu me arrepender?',
    a: 'Você tem 7 dias a partir da compra para desistir, como garante o Código de Defesa do Consumidor para compras on-line. É só falar com a gente pelo WhatsApp.',
  },
  {
    q: 'Preciso entender de tecnologia?',
    a: 'Não. O livro foi escrito para empreendedores, sem jargão técnico, com exemplos do dia a dia de pequenos negócios.',
  },
];

// O que o robô diz na abertura de cada capítulo (leitor e PDF).
export const ROBOT_LINES: Record<string, string> = {
  introducao: 'Oi! Eu vou te acompanhar por todo o livro. Bora deixar sua empresa impossível de ignorar?',
  'por-que-estar-na-internet': 'Seu cliente já está pesquisando agora. A pergunta é: ele vai encontrar você?',
  'divulgacao-estrategica': 'Publicar muito não adianta. Publicar certo, pra pessoa certa, muda tudo.',
  'site-profissional': 'Rede social é aluguel. Site é casa própria. Vamos construir a sua?',
  'encontrado-no-google': 'Vou te mostrar como falar a língua do cliente e do Google ao mesmo tempo.',
  'visitas-em-oportunidades': 'Visita boa é visita que vira conversa. Bora tirar os obstáculos do caminho?',
  'proximo-passo': 'Hora de olhar pro seu negócio e escolher o que fazer primeiro.',
  'plano-de-30-dias': 'Último capítulo! Agora é transformar tudo em rotina, uma semana de cada vez.',
};
