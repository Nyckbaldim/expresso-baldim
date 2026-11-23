import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval, timer } from 'rxjs';
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

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navegador = isPlatformBrowser(this.platformId);
  private readonly plataformaMovel =
    this.navegador
      ? (
          (globalThis.matchMedia?.('(pointer: coarse)').matches ?? false) ||
          (globalThis.matchMedia?.('(hover: none)').matches ?? false) ||
          (globalThis.matchMedia?.('(max-width: 992px)').matches ?? false)
        )
      : false;
  private readonly podeRotacionarAutomaticamente =
    this.navegador &&
    !this.plataformaMovel
      ? (globalThis.matchMedia?.('(hover: hover) and (prefers-reduced-motion: no-preference)').matches ?? false)
      : false;
  private readonly podeAnimar =
    this.navegador
      ? (globalThis.matchMedia?.('(prefers-reduced-motion: no-preference)').matches ?? false)
      : false;

  imagensDestaque = signal<string[]>(['/images/Caminhao.jpeg']);
  indiceImagem = signal(0);
  imagemAtual = computed(() => this.imagensDestaque()[this.indiceImagem()] ?? '/images/Caminhao.jpeg');
  imagemEmHover = signal(false);
  imagemComFoco = signal(false);
  imagemEmTransicao = signal(false);

  constructor() {
    if (!this.navegador) return;

    this.http.get<string[]>('/api/carousel-images').subscribe({
      next: (imagens) => {
        const validas = Array.isArray(imagens)
          ? imagens.filter((imagem) => typeof imagem === 'string' && imagem.startsWith('/images/'))
          : [];
        this.imagensDestaque.set(validas.length ? validas : ['/images/Caminhao.jpeg']);

        if (this.podeRotacionarAutomaticamente && validas.length > 1) {
          interval(5000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              if (!this.imagemEmHover() && !this.imagemComFoco()) this.imagemProxima();
            });
        }
      },
      error: (erro) => console.error('Falha ao carregar imagens do carrossel da frota', erro),
    });
  }

  imagemAnterior(): void {
    this.mudarSlide(this.indiceImagem, this.imagemEmTransicao, -1, this.imagensDestaque().length);
  }

  imagemProxima(): void {
    this.mudarSlide(this.indiceImagem, this.imagemEmTransicao, 1, this.imagensDestaque().length);
  }

  private mudarSlide(
    indice: WritableSignal<number>,
    emTransicao: WritableSignal<boolean>,
    direcao: number,
    total: number,
  ): void {
    if (total < 2 || emTransicao()) return;

    if (!this.podeAnimar) {
      indice.update((atual) => (atual + direcao + total) % total);
      return;
    }

    emTransicao.set(true);
    timer(250)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        indice.update((atual) => (atual + direcao + total) % total);
        timer(20)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => emTransicao.set(false));
      });
  }
}
