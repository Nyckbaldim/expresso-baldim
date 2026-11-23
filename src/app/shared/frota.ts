import type { ImagemCarrossel } from '../components/carrossel-imagens/carrossel-imagens';

export interface Veiculo {
  id: string;
  nome: string;
  configuracao: 'Toco' | 'Truck';
  eixosTraseiros: 1 | 2;
  carroceria: 'Baú';
  ano: number;
  /** Medidas internas do baú (área útil), em metros. */
  comprimentoM: number;
  larguraM: number;
  alturaM: number;
  /** Cubagem informada pela empresa; não é o produto exato C × L × A. */
  cubagemM3: number;
  capacidadeKg: number;
  /** Exibida em moldura de proporção fixa (`fill` + `object-fit: cover`), por isso sem largura/altura. */
  foto: ImagemCarrossel;
}

export const ATEGO_TRUCK: Veiculo = {
  id: 'atego-truck',
  nome: 'Atego Truck',
  configuracao: 'Truck',
  eixosTraseiros: 2,
  carroceria: 'Baú',
  ano: 2024,
  comprimentoM: 11.6,
  larguraM: 2.35,
  alturaM: 2.96,
  cubagemM3: 84,
  capacidadeKg: 13000,
  foto: {
    src: '/images/Carrocel-02.jpeg',
    alt: 'Caminhão baú truck da Expresso Baldim, com dois eixos traseiros, em uma rodovia',
  },
};

export const ATEGO_TOCO: Veiculo = {
  id: 'atego-toco',
  nome: 'Atego Toco',
  configuracao: 'Toco',
  eixosTraseiros: 1,
  carroceria: 'Baú',
  ano: 2022,
  comprimentoM: 9.5,
  larguraM: 2.32,
  alturaM: 2.85,
  cubagemM3: 67,
  capacidadeKg: 7500,
  foto: {
    src: '/images/Carrocel-01.jpeg',
    alt: 'Caminhão baú toco da Expresso Baldim estacionado em uma rua de bairro',
  },
};

/** Frota própria, do maior para o menor. */
export const FROTA: readonly Veiculo[] = [ATEGO_TRUCK, ATEGO_TOCO];
