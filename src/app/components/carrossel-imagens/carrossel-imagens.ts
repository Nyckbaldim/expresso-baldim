import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';

export interface ImagemCarrossel {
  src: string;
  alt: string;
}

const INTERVALO_AUTOPLAY_MS = 5000;

/**
 * Carrossel de imagens acessível (padrão WAI-ARIA "Carousel").
 * As fotos ocupam uma moldura de proporção fixa (`--carrossel-proporcao`, padrão 5 / 3) e são cortadas com `object-fit: cover`.
 * Uma legenda opcional pode ser projetada abaixo dos controles: `<div legenda>...</div>`.
 */
@Component({
  selector: 'app-carrossel-imagens',
  imports: [NgOptimizedImage, ImagemAmpliavelDirective],
  templateUrl: './carrossel-imagens.html',
  styleUrl: './carrossel-imagens.css',
  host: {
    role: 'region',
    'aria-roledescription': 'carrossel',
    '[attr.aria-label]': 'rotuloGrupo()',
    '(mouseenter)': 'emHover.set(true)',
    '(mouseleave)': 'emHover.set(false)',
    '(focusin)': 'comFoco.set(true)',
    '(focusout)': 'aoPerderFoco($event)',
  },
})
export class CarrosselImagens {
  readonly imagens = input.required<readonly ImagemCarrossel[]>();
  readonly rotuloGrupo = input('Galeria de fotos');
  readonly autoplay = input(false);
  /** Carrega a primeira foto com prioridade. Use só quando o carrossel estiver acima da dobra. */
  readonly prioridade = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly movimentoReduzido =
    this.navegador && (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  readonly indice = linkedSignal<readonly ImagemCarrossel[], number>({
    source: this.imagens,
    computation: (lista, anterior) => Math.min(anterior?.value ?? 0, Math.max(lista.length - 1, 0)),
  });
  readonly total = computed(() => this.imagens().length);
  readonly temVarias = computed(() => this.total() > 1);

  readonly pausadoPeloUsuario = signal(false);
  protected readonly emHover = signal(false);
  protected readonly comFoco = signal(false);

  readonly autoplayDisponivel = computed(() => this.autoplay() && this.temVarias() && !this.movimentoReduzido);
  readonly girando = computed(
    () => this.autoplayDisponivel() && !this.pausadoPeloUsuario() && !this.emHover() && !this.comFoco(),
  );

  constructor() {
    effect((aoLimpar) => {
      if (!this.navegador || !this.girando()) return;
      const id = setInterval(() => this.proxima(), INTERVALO_AUTOPLAY_MS);
      aoLimpar(() => clearInterval(id));
    });
  }

  anterior(): void {
    this.irPara(this.indice() - 1);
  }

  proxima(): void {
    this.irPara(this.indice() + 1);
  }

  irPara(posicao: number): void {
    const total = this.total();
    if (total === 0) return;
    this.indice.set((posicao + total) % total);
  }

  alternarPausa(): void {
    this.pausadoPeloUsuario.update((pausado) => !pausado);
  }

  protected aoPerderFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget;
    if (!(destino instanceof Node) || !this.host.nativeElement.contains(destino)) this.comFoco.set(false);
  }
}
