import type { ImagemCarrossel } from '../components/carrossel-imagens/carrossel-imagens';

const FOTO_TRUCK: ImagemCarrossel = {
  src: '/images/Carrocel-02.jpeg',
  alt: 'Caminhão baú truck da Expresso Baldim, com dois eixos traseiros, em uma rodovia',
};

const FOTO_TOCO: ImagemCarrossel = {
  src: '/images/Carrocel-01.jpeg',
  alt: 'Caminhão baú toco da Expresso Baldim estacionado em uma rua de bairro',
};

const ALT_GENERICO_FROTA = 'Caminhão da frota da Expresso Baldim';

// A empresa não tem fotos de equipe, guarda-móveis ou mudanças; por isso a galeria usa as fotos da frota.
// O truck vem primeiro: é a foto mais leve e a que melhor cabe na moldura horizontal.
export const GALERIA_SOBRE_NOS: readonly ImagemCarrossel[] = [FOTO_TRUCK, FOTO_TOCO];

/** Foto exibida na home enquanto a lista de `/api/carousel-images` não chega (e se a API falhar). */
export const FOTO_INICIAL_HOME: ImagemCarrossel = FOTO_TOCO;

const ALT_POR_FOTO = new Map([FOTO_TRUCK, FOTO_TOCO].map((foto) => [foto.src, foto.alt]));

/** Monta a imagem do carrossel a partir do caminho do arquivo, com o `alt` descritivo quando a foto é conhecida. */
export function fotoDaFrota(src: string): ImagemCarrossel {
  return { src, alt: ALT_POR_FOTO.get(src) ?? ALT_GENERICO_FROTA };
}
