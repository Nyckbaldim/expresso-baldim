import type { ImagemCarrossel } from '../components/carrossel-imagens/carrossel-imagens';
import { ATEGO_TOCO, ATEGO_TRUCK, FROTA } from './frota';

const ALT_GENERICO_FROTA = 'Caminhão da frota da Expresso Baldim';

// A empresa não tem fotos de equipe, guarda-móveis ou mudanças; por isso a galeria usa as fotos da frota.
// O truck vem primeiro: é a foto mais leve e a que melhor cabe na moldura horizontal.
export const GALERIA_SOBRE_NOS: readonly ImagemCarrossel[] = [ATEGO_TRUCK.foto, ATEGO_TOCO.foto];

/** Foto exibida na home enquanto a lista de `/api/carousel-images` não chega (e se a API falhar). */
export const FOTO_INICIAL_HOME: ImagemCarrossel = ATEGO_TOCO.foto;

const ALT_POR_FOTO = new Map(FROTA.map(({ foto }) => [foto.src, foto.alt]));

/** Monta a imagem do carrossel a partir do caminho do arquivo, com o `alt` descritivo quando a foto é conhecida. */
export function fotoDaFrota(src: string): ImagemCarrossel {
  return { src, alt: ALT_POR_FOTO.get(src) ?? ALT_GENERICO_FROTA };
}
