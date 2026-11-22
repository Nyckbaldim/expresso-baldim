import { Injectable, signal } from '@angular/core';

export interface ImagemAmpliada {
  src: string;
  alt: string;
}

@Injectable({ providedIn: 'root' })
export class VisualizadorImagemService {
  readonly imagem = signal<ImagemAmpliada | null>(null);

  abrir(src: string, alt: string): void {
    if (src) this.imagem.set({ src, alt });
  }

  fechar(): void {
    this.imagem.set(null);
  }
}
