import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PedidoService } from '../../services/pedido';
import { AvaliacaoService } from '../../services/avaliacao';

@Component({
  selector: 'app-avaliar',
  imports: [ReactiveFormsModule],
  templateUrl: './avaliar.html',
  styleUrl: './avaliar.css',
})
export class Avaliar {
  private fb = inject(FormBuilder);
  private pedidos = inject(PedidoService);
  private avaliacoes = inject(AvaliacaoService);

  erro = signal('');
  enviado = signal(false);

  form = this.fb.nonNullable.group({
    tipo: ['', Validators.required],
    codigo: ['', Validators.required],
    nota: ['', Validators.required],
    motivo: [''],
    comentario: [''],
  });

  enviar() {
    this.enviado.set(false);
    const v = this.form.getRawValue();

    if (!v.tipo || !v.codigo.trim() || !v.nota) {
      this.erro.set('Escolha o tipo de review, informe o código e dê uma nota.');
      return;
    }
    if (v.tipo === 'feedback' && (!v.motivo || !v.comentario.trim())) {
      this.erro.set('Informe o principal motivo e escreva um comentário.');
      return;
    }

    this.pedidos.buscarPorCodigo(v.codigo.trim()).subscribe({
      next: (lista) => {
        if (lista.length === 0 || !lista[0].id) {
          this.erro.set('Nenhum serviço identificado.');
          return;
        }
        this.erro.set('');

        this.avaliacoes
          .criar({
            pedidoId: lista[0].id,
            codigo: v.codigo.trim(),
            tipo: v.tipo as 'feedback' | 'google',
            nota: Number(v.nota),
            motivo: v.tipo === 'feedback' ? v.motivo : undefined,
            comentario: v.tipo === 'feedback' ? v.comentario : undefined,
            criadoEm: new Date().toISOString(),
          })
          .subscribe({
            next: () => {
              this.enviado.set(true);
              this.form.reset({
                tipo: '',
                codigo: '',
                nota: '',
                motivo: '',
                comentario: '',
              });
            },
            error: () => this.erro.set('Não foi possível enviar agora. Tente novamente.'),
          });
      },
      error: () => this.erro.set('Não foi possível consultar o código agora. O servidor está rodando?'),
    });
  }
}