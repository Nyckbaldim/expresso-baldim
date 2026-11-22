import { Directive, ElementRef, inject } from '@angular/core';
import { VisualizadorImagemService } from '../services/visualizador-imagem';

@Directive({
  selector: 'img[imagemAmpliavel]',
  host: {
    role: 'button',
    tabindex: '0',
    'aria-label': 'Abrir imagem em tela cheia',
    'style': 'cursor: zoom-in;',
    '(click)': 'abrir()',
    '(keydown.enter)': 'abrir()',
    '(keydown.space)': 'abrir()',
  },
})
export class ImagemAmpliavelDirective {
  private readonly elemento = inject(ElementRef<HTMLImageElement>);
  private readonly visualizador = inject(VisualizadorImagemService);

  abrir(): void {
    const imagem = this.elemento.nativeElement;
    this.visualizador.abrir(imagem.currentSrc || imagem.src, imagem.alt);
  }
}
