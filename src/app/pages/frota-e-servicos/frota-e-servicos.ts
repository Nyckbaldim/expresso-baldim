import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';
import { FROTA, type Veiculo } from '../../shared/frota';
import { formatarDimensoes, formatarPeso, formatarVolume } from '../../shared/formatar-medidas';

interface CartaoVeiculo extends Veiculo {
  selo: string;
  especificacoes: readonly { rotulo: string; valor: string }[];
}

function paraCartao(veiculo: Veiculo): CartaoVeiculo {
  const eixos = `${veiculo.eixosTraseiros} ${veiculo.eixosTraseiros === 1 ? 'eixo traseiro' : 'eixos traseiros'}`;
  return {
    ...veiculo,
    selo: [veiculo.carroceria, veiculo.configuracao, eixos].join(' · '),
    especificacoes: [
      { rotulo: 'Capacidade de carga', valor: formatarPeso(veiculo.capacidadeKg) },
      { rotulo: 'Cubagem', valor: formatarVolume(veiculo.cubagemM3) },
      {
        rotulo: 'Medidas internas do baú (C × L × A)',
        valor: formatarDimensoes(veiculo.comprimentoM, veiculo.larguraM, veiculo.alturaM),
      },
    ],
  };
}

@Component({
  imports: [RouterLink, ImagemAmpliavelDirective, NgOptimizedImage],
  standalone: true,
  selector: 'app-frota-e-servicos',
  styleUrl: './frota-e-servicos.css',
  templateUrl: './frota-e-servicos.html',
})
export class FrotaEServicos {
  protected readonly cartoes = FROTA.map(paraCartao);
}
