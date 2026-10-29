// Imagens oficiais da NPWTech usadas no site.
// Para trocar uma imagem, substitua o arquivo nesta pasta mantendo o mesmo nome.
//
// robot.webp      → robô/mascote da NPWTech, com fundo removido (gerado a partir de "Robô_futurista_sorridente_dando_joinha.png")
// logo_full.webp  → logo completa (símbolo + "NPW TECH"), fundo transparente, para áreas claras
// logo_mark.webp  → somente o símbolo hexagonal, fundo transparente (cabeçalho e capa do ebook)
// logo_dark.webp  → versão do símbolo sobre fundo preto (imagem original enviada)
import robot from './robot.webp';
import logoFull from './logo_full.webp';
import logoMark from './logo_mark.webp';
import logoDark from './logo_dark.webp';

export const ASSETS = {
  robot,
  robotAlt: 'Robô da NPWTech: corpo branco e grafite, tela preta no rosto com olhos e sorriso iluminados, fazendo sinal de positivo, com o símbolo da NPWTech no peito.',
  logoFull,
  logoFullAlt: 'Logo da NPWTech',
  logoMark,
  logoDark,
};
