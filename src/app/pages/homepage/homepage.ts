import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal, type WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, timer } from 'rxjs';
import { DepoimentoService, Depoimento } from '../../services/depoimento';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, ImagemAmpliavelDirective],
  styleUrl: './homepage.css',
  templateUrl: './homepage.html',
})
export class Homepage {
  private servico = inject(DepoimentoService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navegador = isPlatformBrowser(this.platformId);
  private readonly podeRotacionarAutomaticamente =
    this.navegador
      ? (globalThis.matchMedia?.('(hover: hover) and (prefers-reduced-motion: no-preference)').matches ?? false)
      : false;
  private readonly podeAnimar =
    this.navegador
      ? (globalThis.matchMedia?.('(prefers-reduced-motion: no-preference)').matches ?? false)
      : false;

  depoimentos = signal<Depoimento[]>([]);
  indice = signal(0);
  avaliacaoEmHover = signal(false);
  avaliacaoComFoco = signal(false);
  avaliacaoEmTransicao = signal(false);
  atual = computed(() => this.depoimentos()[this.indice()] ?? null);
  imagensDestaque = signal<string[]>(['/images/Caminhao.jpeg']);
  indiceImagem = signal(0);
  imagemAtual = computed(() => this.imagensDestaque()[this.indiceImagem()] ?? '/images/Caminhao.jpeg');
  imagemEmHover = signal(false);
  imagemComFoco = signal(false);
  imagemEmTransicao = signal(false);

  constructor() {
    this.carregarImagensDestaque();
    this.servico.listarPublicados().subscribe({
      next: (lista) => {
        this.depoimentos.set(lista);
        if (this.podeRotacionarAutomaticamente && lista.length > 1) {
          interval(5000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              if (!this.avaliacaoEmHover() && !this.avaliacaoComFoco()) this.proximo();
            });
        }
      },
      error: (e) => { console.error('Falha ao carregar depoimentos', e); this.depoimentos.set([]); },
    });
  }

  private carregarImagensDestaque(): void {
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
              if (!this.imagemEmHover() && !this.imagemComFoco()) this.proximaImagem();
            });
        }
      },
      error: (erro) => console.error('Falha ao carregar imagens do carrossel', erro),
    });
  }

  anterior() {
    this.mudarSlide(this.indice, this.avaliacaoEmTransicao, -1, this.depoimentos().length);
  }

  proximo() {
    this.mudarSlide(this.indice, this.avaliacaoEmTransicao, 1, this.depoimentos().length);
  }

  imagemAnterior() {
    this.mudarSlide(this.indiceImagem, this.imagemEmTransicao, -1, this.imagensDestaque().length);
  }

  imagemProxima() {
    this.mudarSlide(this.indiceImagem, this.imagemEmTransicao, 1, this.imagensDestaque().length);
  }

  private proximaImagem(): void {
    this.imagemProxima();
  }

  private mudarSlide(indice: WritableSignal<number>, emTransicao: WritableSignal<boolean>, direcao: number, total: number): void {
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
