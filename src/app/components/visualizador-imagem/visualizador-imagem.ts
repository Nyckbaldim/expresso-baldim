import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { VisualizadorImagemService } from '../../services/visualizador-imagem';

@Component({
  selector: 'app-visualizador-imagem',
  imports: [],
  templateUrl: './visualizador-imagem.html',
  styleUrl: './visualizador-imagem.css',
})
export class VisualizadorImagem {
  readonly servico = inject(VisualizadorImagemService);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const imagem = this.servico.imagem();
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;

      if (imagem && !dialog.open) dialog.showModal();
      if (!imagem && dialog.open) dialog.close();
    });
  }

  fechar(): void {
    this.servico.fechar();
  }

  fecharAoClicarFora(evento: MouseEvent): void {
    if (evento.target === this.dialog()?.nativeElement) this.fechar();
  }
}
