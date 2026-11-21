import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepoimentoService, Depoimento } from '../../services/depoimento';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './homepage.css',
  templateUrl: './homepage.html',
})
export class Homepage {
  private servico = inject(DepoimentoService);

  depoimentos = signal<Depoimento[]>([]);
  indice = signal(0);
  atual = computed(() => this.depoimentos()[this.indice()] ?? null);

  constructor() {
    this.servico.listarPublicados().subscribe({
      next: (lista) => this.depoimentos.set(lista),
      error: (e) => { console.error('Falha ao carregar depoimentos', e); this.depoimentos.set([]); },
    });
  }

  anterior() {
    const n = this.depoimentos().length;
    if (n) this.indice.update((i) => (i - 1 + n) % n);
  }
  proximo() {
    const n = this.depoimentos().length;
    if (n) this.indice.update((i) => (i + 1) % n);
  }
}
