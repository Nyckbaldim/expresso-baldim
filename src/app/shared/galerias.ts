import type { ImagemCarrossel } from '../components/carrossel-imagens/carrossel-imagens';

// A empresa não tem fotos de equipe, guarda-móveis ou mudanças; por isso a galeria usa as fotos da frota.
// O truck vem primeiro: é a foto mais leve e a que melhor cabe na moldura horizontal.
export const GALERIA_SOBRE_NOS: readonly ImagemCarrossel[] = [
  {
    src: '/images/Carrocel-02.jpeg',
    alt: 'Caminhão baú truck da Expresso Baldim, com dois eixos traseiros, em uma rodovia',
  },
  {
    src: '/images/Carrocel-01.jpeg',
    alt: 'Caminhão baú toco da Expresso Baldim estacionado em uma rua de bairro',
  },
];
