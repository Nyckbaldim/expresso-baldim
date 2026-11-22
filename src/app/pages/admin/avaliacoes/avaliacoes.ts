import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Avaliacao, AvaliacaoService } from '../../../services/avaliacao';

@Component({
  imports: [DatePipe],
  selector: 'eb-avaliacoes',
  styleUrl: './avaliacoes.css',
  templateUrl: './avaliacoes.html',
})
export class Avaliacoes implements OnInit {
  private readonly servico = inject(AvaliacaoService);

  protected readonly avaliacoes = signal<Avaliacao[]>([]);
  protected readonly ordenadas = computed(() =>
    [...this.avaliacoes()].sort((a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm)),
  );
  protected readonly carregando = signal(false);
  protected readonly erro = signal('');

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.servico.listar().subscribe({
      next: (avaliacoes) => {
        this.avaliacoes.set(avaliacoes);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as avaliações. Tente novamente.');
        this.carregando.set(false);
      },
    });
  }

  protected rotuloTipo(tipo: Avaliacao['tipo']): string {
    return tipo === 'feedback' ? 'Feedback reservado' : 'Google Review';
  }
}
