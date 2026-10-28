// Conteúdo do curso "Sua Empresa no Digital".
// Os roteiros abaixo são os textos originais do curso NPWTech.
// Para editar o conteúdo, altere somente este arquivo: a interface se ajusta sozinha.

export type ExerciseField =
  | { id: string; kind: 'textarea'; label: string; placeholder?: string; rows?: number }
  | { id: string; kind: 'input'; label: string; placeholder?: string }
  | { id: string; kind: 'checklist'; label: string; items: { id: string; label: string }[] }
  | { id: string; kind: 'priority'; label: string; from: string[] };

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface CourseModule {
  id: string; // usado na URL: #modulo-1
  number: number;
  title: string;
  lessonLabel: string;
  duration: string;
  minutes: number;
  topics: string[];
  objective: string;
  script: string[]; // parágrafos narrados pelo robô
  exercise: {
    prompt: string; // texto original do exercício prático
    fields: ExerciseField[];
  };
  quiz: QuizQuestion[];
  note?: { title: string; text: string }; // chamada discreta da NPWTech
}

export const COURSE = {
  platform: 'NPWTech Academy',
  title: 'Sua Empresa no Digital',
  tagline: 'Sua próxima etapa começa com conhecimento.',
  subtitle: 'Aprenda a fortalecer sua presença digital e descubra novas oportunidades para seu negócio.',
  description:
    'Um curso prático para empreendedores e pequenos negócios. Aprenda a fortalecer sua presença na internet, transmitir mais credibilidade, apresentar seus serviços e criar oportunidades para conquistar novos clientes.',
  company: 'NPWTech — Soluções Digitais',
  site: 'https://npwtech.com.br',
  siteLabel: 'npwtech.com.br',
  whatsapp: 'https://wa.me/5521970089039',
  whatsappLabel: '(21) 97008-9039',
};

// Roteiro de abertura do curso, narrado no início da primeira aula e na página inicial.
export const OPENING_SCRIPT: string[] = [
  'Olá! Seja muito bem-vindo ao curso Sua Empresa no Digital, desenvolvido pela NPWTech.',
  'Se você tem uma empresa, trabalha por conta própria ou está começando um negócio, este curso é para você.',
  'Talvez você já divulgue seus serviços nas redes sociais, mas queira alcançar mais pessoas, transmitir mais confiança e transformar sua presença na internet em novas oportunidades.',
  'Ao longo das aulas, você vai aprender os fundamentos da divulgação digital, conhecer a importância de um site profissional e descobrir maneiras de melhorar a experiência dos seus clientes na internet.',
  'Não importa se você está começando agora. A proposta é apresentar conceitos práticos, com exemplos que você poderá adaptar à realidade do seu negócio.',
  'Prepare-se para dar os primeiros passos rumo a uma presença digital mais estratégica.',
  'Vamos começar?',
];

export const CLOSING_CTA = {
  title: 'Vamos levar sua empresa mais longe?',
  paragraphs: [
    'Agora que você já conhece os primeiros passos para fortalecer a presença digital da sua empresa, chegou a hora de colocar esse conhecimento em prática.',
    'Se você precisa de um site profissional, de um sistema personalizado ou de um aplicativo para o seu negócio, a NPWTech pode ajudar a transformar sua ideia em uma solução digital.',
    'Entre em contato, conte o que você precisa e solicite um orçamento personalizado.',
  ],
  signature: 'NPWTech — soluções digitais para levar seu negócio mais longe.',
};

export const MODULES: CourseModule[] = [
  {
    id: 'modulo-1',
    number: 1,
    title: 'Por que sua empresa precisa estar na internet?',
    lessonLabel: 'Aula 1',
    duration: '5 a 7 minutos',
    minutes: 6,
    topics: [
      'Como os clientes encontram empresas hoje.',
      'A importância da credibilidade digital.',
      'Diferença entre ser encontrado e ser escolhido.',
    ],
    objective: 'Fazer o aluno reconhecer oportunidades de melhoria no próprio negócio.',
    script: [
      ...OPENING_SCRIPT,
      'Nesta aula, vamos entender por que a presença digital se tornou tão importante para empresas de diferentes tamanhos.',
      'Hoje, muitos consumidores pesquisam na internet antes de contratar um serviço ou comprar um produto. Eles procuram informações, comparam opções e buscam sinais de confiança antes de tomar uma decisão.',
      'Por isso, não basta oferecer um bom produto ou serviço. Também é importante apresentar sua empresa de maneira clara e profissional.',
      'Uma presença digital bem planejada pode ajudar seu negócio a ser conhecido por mais pessoas, transmitir credibilidade e facilitar o contato com potenciais clientes.',
      'Ao longo deste curso, você vai descobrir como melhorar essa presença e identificar oportunidades para desenvolver seu negócio no ambiente digital.',
    ],
    exercise: {
      prompt:
        'Pesquise sua própria empresa na internet e observe quais informações um possível cliente encontra sobre ela.',
      fields: [
        {
          id: 'encontrado',
          kind: 'textarea',
          label: 'O que você encontrou ao pesquisar sua empresa?',
          placeholder: 'Ex.: o perfil no Instagram aparece primeiro, mas o telefone está desatualizado…',
          rows: 4,
        },
        {
          id: 'melhorar',
          kind: 'textarea',
          label: 'O que um possível cliente não conseguiu encontrar?',
          placeholder: 'Ex.: não há fotos dos trabalhos nem horário de atendimento.',
          rows: 3,
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'O que muitos consumidores fazem antes de contratar um serviço ou comprar um produto?',
        options: [
          'Contratam a primeira empresa que aparece.',
          'Pesquisam na internet, comparam opções e buscam sinais de confiança.',
          'Decidem apenas pelo menor preço anunciado.',
          'Evitam procurar informações on-line.',
        ],
        correct: 1,
        explanation:
          'A aula mostra que o cliente pesquisa, compara e procura sinais de confiança antes de decidir. Por isso a forma como sua empresa aparece faz diferença.',
      },
      {
        id: 'q2',
        prompt: 'Segundo a aula, por que não basta oferecer um bom produto ou serviço?',
        options: [
          'Porque a qualidade deixou de importar na internet.',
          'Porque só grandes empresas conseguem clientes on-line.',
          'Porque também é importante apresentar a empresa de maneira clara e profissional.',
          'Porque é obrigatório estar em todas as redes sociais.',
        ],
        correct: 2,
        explanation:
          'Ser encontrado é o primeiro passo. Ser escolhido depende de uma apresentação clara e profissional, que transmita confiança.',
      },
      {
        id: 'q3',
        prompt: 'Qual destes benefícios uma presença digital bem planejada pode trazer?',
        options: [
          'Ajudar a empresa a ser conhecida, transmitir credibilidade e facilitar o contato.',
          'Garantir vendas todos os dias.',
          'Substituir completamente o atendimento ao cliente.',
          'Eliminar a concorrência da região.',
        ],
        correct: 0,
        explanation:
          'Uma presença bem planejada ajuda, mas não faz milagres: amplia o alcance, transmite credibilidade e facilita o contato com potenciais clientes.',
      },
    ],
  },
  {
    id: 'modulo-2',
    number: 2,
    title: 'Como divulgar sua empresa de maneira estratégica',
    lessonLabel: 'Aula 2',
    duration: '7 a 10 minutos',
    minutes: 8,
    topics: [
      'Como definir o público ideal.',
      'Como criar conteúdos que mostrem o valor dos seus serviços.',
      'Como manter uma comunicação profissional nas redes sociais.',
    ],
    objective: 'Ajudar o aluno a melhorar sua divulgação.',
    script: [
      'Divulgar uma empresa vai muito além de publicar imagens ou anunciar produtos. Uma boa estratégia começa com o entendimento de quem você deseja alcançar.',
      'Primeiro, procure conhecer seu público. Quais são suas necessidades? Quais problemas ele enfrenta? Como seu produto ou serviço pode ajudar?',
      'Depois, crie conteúdos que respondam a essas necessidades. Você pode apresentar seus serviços, explicar como funcionam, mostrar projetos realizados e compartilhar orientações úteis.',
      'Também é importante manter uma comunicação consistente, com informações atualizadas, textos claros e uma identidade visual que represente sua marca.',
      'Lembre-se: o objetivo não é publicar por publicar, mas mostrar às pessoas por que sua empresa pode ser uma boa escolha.',
    ],
    exercise: {
      prompt:
        'Planeje três publicações para sua empresa: uma apresentando seus serviços, outra mostrando um diferencial e uma terceira respondendo a uma dúvida frequente dos clientes.',
      fields: [
        { id: 'pub1', kind: 'textarea', label: 'Publicação 1 — apresentando seus serviços', rows: 3, placeholder: 'Ideia, texto ou roteiro da publicação' },
        { id: 'pub2', kind: 'textarea', label: 'Publicação 2 — mostrando um diferencial', rows: 3, placeholder: 'O que só a sua empresa oferece?' },
        { id: 'pub3', kind: 'textarea', label: 'Publicação 3 — respondendo a uma dúvida frequente', rows: 3, placeholder: 'Qual pergunta seus clientes mais fazem?' },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'Por onde começa uma boa estratégia de divulgação?',
        options: [
          'Pela compra de anúncios pagos.',
          'Pela publicação diária de imagens.',
          'Pela troca da identidade visual.',
          'Pelo entendimento de quem você deseja alcançar.',
        ],
        correct: 3,
        explanation:
          'Antes de publicar, é preciso conhecer o público: suas necessidades, seus problemas e como seu serviço pode ajudar.',
      },
      {
        id: 'q2',
        prompt: 'Que tipo de conteúdo a aula recomenda criar?',
        options: [
          'Somente promoções e descontos.',
          'Conteúdos que respondam às necessidades do público.',
          'Publicações sem relação com o negócio, para gerar alcance.',
          'Conteúdos copiados de concorrentes.',
        ],
        correct: 1,
        explanation:
          'Bons conteúdos respondem às necessidades do público: apresentam serviços, explicam como funcionam, mostram projetos e trazem orientações úteis.',
      },
      {
        id: 'q3',
        prompt: 'O que ajuda a manter uma comunicação profissional nas redes sociais?',
        options: [
          'Informações atualizadas, textos claros e identidade visual consistente.',
          'Mudar o estilo visual a cada publicação.',
          'Publicar por publicar, para manter a frequência.',
          'Responder apenas às mensagens mais antigas.',
        ],
        correct: 0,
        explanation:
          'Consistência transmite profissionalismo: informações em dia, textos claros e uma identidade visual que represente a marca.',
      },
    ],
  },
  {
    id: 'modulo-3',
    number: 3,
    title: 'O papel de um site profissional',
    lessonLabel: 'Aula 3',
    duration: '7 a 10 minutos',
    minutes: 8,
    topics: [
      'Para que serve um site empresarial.',
      'Quais páginas um negócio pode precisar.',
      'Como apresentar serviços, portfólio e contatos.',
      'Como oferecer uma boa experiência no celular.',
    ],
    objective: 'Mostrar como um site pode complementar as redes sociais e facilitar o contato comercial.',
    script: [
      'As redes sociais são ferramentas importantes para divulgar uma empresa, mas um site profissional pode ampliar as possibilidades de apresentação do seu negócio.',
      'Com um site, você pode organizar informações sobre sua empresa, apresentar seus serviços, mostrar projetos, disponibilizar formas de contato e oferecer aos visitantes uma experiência mais completa.',
      'Um site também pode ser desenvolvido de acordo com as necessidades de cada negócio. Uma loja pode precisar de funcionalidades diferentes das de um salão de beleza, de uma empresa de manutenção ou de um profissional autônomo.',
      'Outro ponto importante é a adaptação para celulares. Como muitas pessoas acessam a internet pelo smartphone, seu site precisa oferecer uma navegação prática em diferentes dispositivos.',
      'Um site bem planejado não garante vendas automaticamente, mas pode ajudar a transmitir credibilidade, apresentar seus diferenciais e facilitar a jornada do cliente.',
    ],
    exercise: {
      prompt:
        'Liste as informações que um cliente precisaria encontrar para conhecer sua empresa e decidir se deseja entrar em contato.',
      fields: [
        {
          id: 'lista',
          kind: 'textarea',
          label: 'Informações essenciais para o seu cliente',
          placeholder: 'Ex.: serviços oferecidos, fotos de trabalhos, região atendida, horário, WhatsApp…',
          rows: 6,
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'Segundo a aula, o que um site profissional permite fazer?',
        options: [
          'Substituir todo o atendimento ao cliente.',
          'Garantir vendas automaticamente.',
          'Organizar informações, apresentar serviços e disponibilizar formas de contato.',
          'Dispensar a presença nas redes sociais.',
        ],
        correct: 2,
        explanation:
          'O site complementa as redes sociais: organiza informações, apresenta serviços e projetos e facilita o contato. A aula reforça que ele não garante vendas sozinho.',
      },
      {
        id: 'q2',
        prompt: 'Por que a adaptação para celulares é importante?',
        options: [
          'Porque muitas pessoas acessam a internet pelo smartphone.',
          'Porque sites para computador deixaram de funcionar.',
          'Porque no celular o conteúdo do site não importa.',
          'Porque celulares não abrem redes sociais.',
        ],
        correct: 0,
        explanation:
          'Como grande parte dos acessos acontece pelo celular, o site precisa oferecer navegação prática em diferentes dispositivos.',
      },
      {
        id: 'q3',
        prompt: 'Sobre as funcionalidades de um site, o que a aula afirma?',
        options: [
          'Todos os sites empresariais devem ser iguais.',
          'Somente lojas precisam de um site.',
          'Funcionalidades não influenciam a experiência do visitante.',
          'Cada negócio pode precisar de funcionalidades diferentes.',
        ],
        correct: 3,
        explanation:
          'Uma loja, um salão de beleza e um profissional autônomo têm necessidades diferentes. O site deve ser pensado para a realidade de cada negócio.',
      },
    ],
    note: {
      title: 'Precisa de um site para o seu negócio?',
      text: 'A NPWTech desenvolve sites profissionais adaptados para celular e pensados para a realidade de cada empresa. Se quiser colocar esta aula em prática, você pode solicitar um orçamento sem compromisso.',
    },
  },
  {
    id: 'modulo-4',
    number: 4,
    title: 'Como ser encontrado no Google',
    lessonLabel: 'Aula 4',
    duration: '7 a 10 minutos',
    minutes: 8,
    topics: [
      'O que é SEO e como funciona.',
      'Como escolher palavras-chave relevantes.',
      'A importância de informações claras e conteúdo útil.',
      'Como trabalhar a presença local da empresa.',
    ],
    objective: 'Ensinar os primeiros passos para melhorar a visibilidade nas pesquisas, sem prometer posições garantidas.',
    script: [
      'Você já pesquisou um serviço no Google e encontrou diversas empresas oferecendo a mesma solução?',
      'É nesse cenário que entra o SEO, sigla em inglês para otimização para mecanismos de busca.',
      'O SEO reúne práticas que ajudam os mecanismos de busca a compreender o conteúdo de um site e identificar quando ele pode ser relevante para determinada pesquisa.',
      'Um dos primeiros passos é entender como seus clientes procuram o serviço que você oferece. Por exemplo, uma pessoa pode pesquisar por desenvolvimento de sites, criação de lojas virtuais ou assistência técnica em sua cidade.',
      'Utilizar termos relevantes nos conteúdos, organizar as páginas, produzir informações úteis e manter os dados da empresa atualizados são medidas que podem contribuir para sua presença nas pesquisas.',
      'Para negócios que atendem uma região específica, também é importante trabalhar informações locais e manter o perfil da empresa no Google atualizado, quando aplicável.',
      'É importante lembrar que os resultados de SEO levam tempo e dependem de diversos fatores. Nenhuma estratégia séria pode garantir a primeira posição no Google.',
    ],
    exercise: {
      prompt:
        'Anote cinco termos que seus clientes poderiam pesquisar para encontrar sua empresa e utilize-os como ponto de partida para melhorar seus conteúdos.',
      fields: [
        { id: 't1', kind: 'input', label: 'Termo 1', placeholder: 'Ex.: conserto de ar-condicionado em Niterói' },
        { id: 't2', kind: 'input', label: 'Termo 2' },
        { id: 't3', kind: 'input', label: 'Termo 3' },
        { id: 't4', kind: 'input', label: 'Termo 4' },
        { id: 't5', kind: 'input', label: 'Termo 5' },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'O que é SEO?',
        options: [
          'Um tipo de anúncio pago no Google.',
          'Práticas que ajudam os mecanismos de busca a compreender o conteúdo de um site.',
          'Uma rede social para empresas.',
          'Um serviço que garante a primeira posição nas pesquisas.',
        ],
        correct: 1,
        explanation:
          'SEO significa otimização para mecanismos de busca: um conjunto de práticas para que o Google entenda quando seu conteúdo é relevante para uma pesquisa.',
      },
      {
        id: 'q2',
        prompt: 'Qual é um dos primeiros passos apresentados na aula?',
        options: [
          'Repetir a mesma palavra em todos os textos.',
          'Remover as informações de contato do site.',
          'Entender como seus clientes procuram o serviço que você oferece.',
          'Copiar o conteúdo de um concorrente bem posicionado.',
        ],
        correct: 2,
        explanation:
          'Tudo começa pelos termos que o cliente realmente digita, como "assistência técnica em sua cidade". Eles orientam o conteúdo das páginas.',
      },
      {
        id: 'q3',
        prompt: 'Sobre os resultados de SEO, qual afirmação está correta?',
        options: [
          'Aparecem no mesmo dia em que o site é publicado.',
          'Podem ser garantidos por qualquer agência.',
          'Dependem apenas do design do site.',
          'Levam tempo e dependem de diversos fatores.',
        ],
        correct: 3,
        explanation:
          'Nenhuma estratégia séria garante a primeira posição. SEO é trabalho contínuo, com resultados que aparecem ao longo do tempo.',
      },
    ],
  },
  {
    id: 'modulo-5',
    number: 5,
    title: 'Transformando visitas em oportunidades',
    lessonLabel: 'Aula 5',
    duration: '5 a 10 minutos',
    minutes: 7,
    topics: [
      'Como facilitar o contato pelo WhatsApp.',
      'Como apresentar diferenciais e depoimentos reais.',
      'Como criar chamadas para ação.',
      'Como acompanhar contatos e resultados.',
    ],
    objective: 'Mostrar que divulgar é importante, mas facilitar a conversão também é essencial.',
    script: [
      'Atrair visitantes para suas redes sociais ou para seu site é importante, mas o próximo passo é ajudá-los a entender o que fazer quando tiverem interesse no seu produto ou serviço.',
      'Imagine que uma pessoa encontrou sua empresa, gostou do que viu, mas não conseguiu descobrir como solicitar um orçamento. Essa dificuldade pode fazer com que ela procure outra opção.',
      'Por isso, deixe suas informações de contato visíveis e utilize chamadas para ação claras, como “Solicite um orçamento”, “Fale conosco” ou “Conheça nossos serviços”.',
      'Também procure apresentar seus diferenciais e, quando disponíveis, depoimentos verdadeiros de clientes e exemplos de trabalhos realizados. Essas informações podem ajudar as pessoas a conhecer melhor sua empresa.',
      'Outro passo importante é acompanhar os contatos recebidos, responder às dúvidas e observar quais canais geram mais oportunidades.',
      'Assim, você consegue identificar o que funciona melhor e aperfeiçoar suas estratégias ao longo do tempo.',
    ],
    exercise: {
      prompt:
        'Verifique se seus perfis e seu site deixam claro como um interessado pode entrar em contato com você. Faça os ajustes necessários.',
      fields: [
        {
          id: 'checagem',
          kind: 'checklist',
          label: 'Marque o que já está claro nos seus canais',
          items: [
            { id: 'contato', label: 'Telefone ou WhatsApp visível' },
            { id: 'cta', label: 'Chamada para ação clara, como “Solicite um orçamento”' },
            { id: 'diferenciais', label: 'Diferenciais da empresa apresentados' },
            { id: 'provas', label: 'Depoimentos reais ou exemplos de trabalhos' },
            { id: 'acompanhamento', label: 'Sei quais canais trazem mais contatos' },
          ],
        },
        { id: 'ajustes', kind: 'textarea', label: 'Ajustes que você vai fazer', rows: 3, placeholder: 'Ex.: colocar o link do WhatsApp na bio do Instagram.' },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'Por que é importante deixar as informações de contato visíveis?',
        options: [
          'Para que o interessado saiba como solicitar um orçamento sem dificuldade.',
          'Para preencher espaço na página.',
          'Porque é uma exigência das redes sociais.',
          'Para que os clientes parem de fazer perguntas.',
        ],
        correct: 0,
        explanation:
          'Se a pessoa gostou do que viu, mas não descobre como pedir um orçamento, ela pode procurar outra opção. Contato visível evita essa perda.',
      },
      {
        id: 'q2',
        prompt: 'Qual destes é um exemplo de chamada para ação citado na aula?',
        options: ['“Role até o fim da página”', '“Leia os termos de uso”', '“Clique em qualquer lugar”', '“Solicite um orçamento”'],
        correct: 3,
        explanation:
          'Chamadas para ação dizem ao visitante qual é o próximo passo: “Solicite um orçamento”, “Fale conosco” ou “Conheça nossos serviços”.',
      },
      {
        id: 'q3',
        prompt: 'Que tipo de depoimento a aula recomenda apresentar?',
        options: [
          'Depoimentos escritos pela própria empresa.',
          'Depoimentos verdadeiros de clientes, quando disponíveis.',
          'Avaliações copiadas de outras empresas.',
          'Nenhum tipo de depoimento.',
        ],
        correct: 1,
        explanation:
          'Só depoimentos verdadeiros geram confiança de forma honesta. Exemplos reais de trabalhos também ajudam o cliente a conhecer sua empresa.',
      },
    ],
  },
  {
    id: 'modulo-6',
    number: 6,
    title: 'O próximo passo para o crescimento digital',
    lessonLabel: 'Aula 6',
    duration: 'aproximadamente 5 minutos',
    minutes: 5,
    topics: [
      'Checklist para avaliar a presença digital da empresa.',
      'Como identificar o que precisa ser melhorado.',
      'Quando considerar um site, sistema ou aplicativo personalizado.',
    ],
    objective: 'Apresentar a NPWTech como parceira para implementar soluções digitais.',
    script: [
      'Chegamos à última aula do curso Sua Empresa no Digital!',
      'Agora que você conhece os fundamentos da divulgação digital, da presença profissional na internet e da otimização para mecanismos de busca, é hora de avaliar como essas estratégias podem ser aplicadas ao seu negócio.',
      'Comece verificando se as informações da sua empresa estão atualizadas, se seus serviços são apresentados com clareza e se seus clientes conseguem entrar em contato com facilidade.',
      'Depois, identifique quais melhorias fazem mais sentido para sua realidade.',
      'Talvez você precise organizar melhor suas redes sociais. Talvez seja o momento de desenvolver um site profissional, criar um sistema para facilitar processos internos ou investir em um aplicativo para atender seus clientes.',
      'Cada negócio tem necessidades diferentes. Por isso, o ideal é escolher soluções alinhadas aos seus objetivos, ao seu público e aos seus recursos disponíveis.',
      'O mais importante é entender que a presença digital pode ser desenvolvida continuamente, acompanhando o crescimento da sua empresa.',
    ],
    exercise: {
      prompt:
        'Escolha três melhorias que você gostaria de implementar nos próximos meses e defina qual delas será sua prioridade.',
      fields: [
        { id: 'm1', kind: 'input', label: 'Melhoria 1', placeholder: 'Ex.: criar um site com página de serviços' },
        { id: 'm2', kind: 'input', label: 'Melhoria 2', placeholder: 'Ex.: atualizar o perfil da empresa no Google' },
        { id: 'm3', kind: 'input', label: 'Melhoria 3', placeholder: 'Ex.: planejar publicações semanais' },
        { id: 'prioridade', kind: 'priority', label: 'Qual delas será sua prioridade?', from: ['m1', 'm2', 'm3'] },
      ],
    },
    quiz: [
      {
        id: 'q1',
        prompt: 'Qual é o primeiro passo sugerido para avaliar a presença digital da sua empresa?',
        options: [
          'Contratar todos os serviços digitais de uma vez.',
          'Verificar se as informações estão atualizadas, os serviços claros e o contato fácil.',
          'Excluir os perfis antigos das redes sociais.',
          'Copiar a estratégia de grandes marcas.',
        ],
        correct: 1,
        explanation:
          'A avaliação começa pelo básico: informações atualizadas, serviços apresentados com clareza e contato fácil para o cliente.',
      },
      {
        id: 'q2',
        prompt: 'Como escolher as melhorias certas para o seu negócio?',
        options: [
          'Escolhendo sempre a opção mais cara.',
          'Seguindo a tendência do momento.',
          'Alinhando as soluções aos objetivos, ao público e aos recursos disponíveis.',
          'Implementando tudo ao mesmo tempo.',
        ],
        correct: 2,
        explanation:
          'Cada negócio tem necessidades diferentes. A melhor escolha é a que combina com seus objetivos, seu público e seus recursos.',
      },
      {
        id: 'q3',
        prompt: 'Qual é a ideia central da última aula sobre presença digital?',
        options: [
          'Ela pode ser desenvolvida continuamente, acompanhando o crescimento da empresa.',
          'Ela é construída uma única vez e não precisa mudar.',
          'Ela só importa para empresas grandes.',
          'Ela depende apenas de ter muitos seguidores.',
        ],
        correct: 0,
        explanation:
          'Presença digital é um processo contínuo: evolui junto com a sua empresa, um passo de cada vez.',
      },
    ],
    note: {
      title: 'Quando contar com a NPWTech',
      text: 'Se uma das suas prioridades for um site, um sistema para processos internos ou um aplicativo, a NPWTech pode desenvolver a solução com você. Ao concluir o curso, você encontra os contatos para pedir um orçamento.',
    },
  },
];

export const TOTAL_MINUTES = MODULES.reduce((sum, m) => sum + m.minutes, 0);

/** Divide os parágrafos em frases para a narração e as legendas sincronizadas. */
export function toSentences(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const p of paragraphs) {
    const parts = p.match(/[^.!?]+[.!?]+[”"]?|[^.!?]+$/g) ?? [p];
    for (const part of parts) {
      const s = part.trim();
      if (s) out.push(s);
    }
  }
  return out;
}

export function narrationFor(mod: CourseModule): string[] {
  return toSentences([...mod.script, `Exercício prático: ${mod.exercise.prompt}`]);
}

export function getModule(id: string): CourseModule | undefined {
  return MODULES.find((m) => m.id === id);
}
