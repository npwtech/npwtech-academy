# NPWTech Academy — Sua Empresa no Digital

Plataforma de curso interativa da NPWTech, com o robô da marca como apresentador, narração por voz do navegador, legendas sincronizadas, transcrição, exercícios, quizzes e progresso salvo localmente.

Feita com React 18 + TypeScript + Vite. Sem backend, sem chaves de API e sem serviços pagos.

## Como rodar no Windows (Prompt de Comando)

Pré-requisito: [Node.js](https://nodejs.org) 18 ou mais recente.

```cmd
cd caminho\para\npwtech-academy
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

### Gerar a versão para publicar

```cmd
npm run build
```

O resultado é **um único arquivo**: `dist\index.html`, com CSS, JavaScript e imagens embutidos.
Você pode:

- abrir esse arquivo direto no navegador (dois cliques);
- enviar para qualquer hospedagem estática (Hostinger, Netlify, Vercel, cPanel etc.), por exemplo em `npwtech.com.br/academy/`.

As fontes Space Grotesk e DM Sans vêm do Google Fonts. Sem internet, o navegador usa as fontes alternativas do sistema.

## Onde ficam as imagens da marca

```
src/assets/
├─ robot.webp       → robô da NPWTech com fundo removido (apresentador)
├─ logo_full.webp   → logo completa, fundo transparente (seções claras)
├─ logo_mark.webp   → símbolo hexagonal, fundo transparente (cabeçalho)
└─ logo_dark.webp   → símbolo sobre fundo preto (original enviado)
```

Para trocar uma imagem, substitua o arquivo mantendo o mesmo nome e rode `npm run build` de novo.
O robô funciona melhor em PNG/WebP com fundo transparente.

## Onde editar o conteúdo

Todo o texto do curso está em **`src/data/course.ts`**: roteiros narrados, tópicos, objetivos, exercícios, perguntas dos quizzes, contatos e a chamada final. A interface se ajusta sozinha ao conteúdo.

## Estrutura

```
src/
├─ data/course.ts            conteúdo dos 6 módulos
├─ state/
│  ├─ progress.tsx           progresso e preferências (localStorage)
│  ├─ speech.tsx             motor de narração (SpeechSynthesis)
│  └─ router.ts              navegação por âncoras (#painel, #modulo-1…)
├─ components/
│  ├─ AppHeader, SiteFooter
│  ├─ Landing                página inicial do curso
│  ├─ CourseDashboard        painel do aluno
│  ├─ LessonPlayer           área de aprendizagem
│  ├─ CourseSidebar          menu de módulos (gaveta no celular)
│  ├─ RobotPresenter         robô animado (flutuação, respiração, brilho, estados)
│  ├─ AudioControls          ouvir, pausar, repetir, frases, velocidade
│  ├─ LessonTranscript       transcrição com frase atual destacada
│  ├─ ExercisePanel          exercício com respostas salvas
│  ├─ QuizPanel              3 perguntas por módulo, feedback e nova tentativa
│  ├─ ProgressIndicator      anel, barra, etapas e interruptores
│  ├─ SettingsDialog         voz, velocidade, timbre, legendas, texto, animações
│  └─ CourseCompletion       conclusão e chamada comercial
└─ styles/                   tokens do Design System e CSS por área
```

## Endereços das telas

| Tela | Endereço |
|---|---|
| Página inicial | `#inicio` |
| Lista de aulas | `#aulas` |
| Painel do aluno | `#painel` |
| Aula de um módulo | `#modulo-1` … `#modulo-6` |
| Exercício / quiz de um módulo | `#modulo-3-exercicio`, `#modulo-3-quiz` |
| Conclusão e chamada final | `#conclusao` |

## O que depende do navegador ou de serviços externos

| Recurso | Depende de | Se não estiver disponível |
|---|---|---|
| Narração do robô | Web Speech API (`speechSynthesis`) do navegador | Aviso na tela; aula segue com legendas, transcrição e avanço manual das frases |
| Vozes em português | Vozes instaladas no sistema. No Windows, o Edge oferece vozes "Online (Natural)" em pt-BR; o Chrome oferece "Google português do Brasil" | Usa a voz padrão do navegador |
| Som "robótico" | Ajuste de timbre (pitch) da própria API; o resultado varia por voz | A voz continua clara e funcional |
| Progresso salvo | `localStorage` do navegador | Aviso na tela; o progresso vale enquanto a página estiver aberta |
| Fontes | Google Fonts | Fontes do sistema (Segoe UI no Windows) |
| Links "Solicitar um orçamento" e "Conhecer a NPWTech" | wa.me e npwtech.com.br | Número e site também aparecem como texto |

O progresso é **local**: fica só no navegador e no dispositivo em que o aluno estudou. Não há login nem sincronização entre aparelhos.

## Limitações conhecidas

- A imagem do robô é uma figura única: as animações movem a imagem inteira (flutuar, respirar, inclinar e brilho na tela do rosto). Não existe sincronização labial.
- Alguns navegadores móveis pausam a fala quando a tela bloqueia.
- O botão "Pausar" usa a pausa nativa da API. Se o navegador não retomar, a frase atual é reiniciada automaticamente.
