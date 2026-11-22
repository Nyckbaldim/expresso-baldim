import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval, timer } from 'rxjs';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';

@Component({
  imports: [RouterLink, ImagemAmpliavelDirective],
  standalone: true,
  selector: 'app-frota-e-servicos',
  styleUrl: './frota-e-servicos.css',
  templateUrl: './frota-e-servicos.html',
})
export class FrotaEServicos {
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
