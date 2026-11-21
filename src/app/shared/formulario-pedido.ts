import { ViewportScroller } from '@angular/common';
import { computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Endereco, NovoPedido } from '../models/pedido';
import { CepService } from '../services/cep';
import { PedidoService } from '../services/pedido';
import {
  QUANTIDADE_MAXIMA_FOTOS,
  TAMANHO_MAXIMO_BYTES,
  TIPOS_ACEITOS,
  reduzirImagem,
} from './imagens';
import { codigoAleatorio, formatarCep, formatarTelefone, soDigitos } from './mascaras';
import { digitos } from './validadores';

export type ChaveEndereco = 'origem' | 'destino';

export interface ValorEndereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  andar: string;
  elevador: string;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export abstract class FormularioPedido {
  protected readonly fb = inject(FormBuilder);
  private readonly pedidos = inject(PedidoService);
  private readonly cep = inject(CepService);
  private readonly rolagem = inject(ViewportScroller);

  abstract readonly form: FormGroup;
  protected abstract montarPedido(codigo: string, fotos: string[]): NovoPedido;
  protected abstract montarMensagemWhatsapp(pedido: NovoPedido): string;

  readonly ufs = UFS;
  readonly hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  readonly enviando = signal(false);
  readonly codigoGerado = signal('');
  readonly linkWhatsapp = signal('');
  readonly erroEnvio = signal('');

  readonly statusCep = signal<Record<ChaveEndereco, string>>({ origem: '', destino: '' });

  readonly fotos = signal<File[]>([]);
  readonly erroFotos = signal('');
  readonly statusFotos = computed(() => {
    const n = this.fotos().length;
    if (n === 0) return 'Nenhum arquivo selecionado.';
    return n === 1 ? '1 arquivo selecionado.' : `${n} arquivos selecionados.`;
  });

  protected readonly formatarCep = formatarCep;
  protected readonly formatarTelefone = formatarTelefone;

  protected grupoEndereco(comAcesso = false) {
    const acesso = comAcesso ? [Validators.required] : [];
    return this.fb.nonNullable.group({
      cep: ['', [Validators.required, digitos(8)]],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      andar: ['', acesso],
      elevador: ['', acesso],
    });
  }

  invalido(caminho: string): boolean {
    const c = this.form.get(caminho);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  erro(caminho: string): string {
    const e = this.form.get(caminho)?.errors;
    if (!e) return '';
    if (e['required']) return 'Campo obrigatório.';
    if (e['email']) return 'Informe um e-mail válido.';
    if (e['minlength']) return `Digite pelo menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['min']) return 'Informe um valor maior que zero.';
    if (e['dataPassada']) return 'Escolha uma data a partir de hoje.';
    if (e['digitos']) {
      const esperado: number[] = e['digitos'].esperado;
      return `Informe ${esperado.join(' ou ')} dígitos.`;
    }
    return 'Valor inválido.';
  }

  mascarar(evento: Event, caminho: string, formatar: (v: string) => string): void {
    const campo = evento.target as HTMLInputElement;
    const formatado = formatar(campo.value);
    campo.value = formatado;
    this.form.get(caminho)?.setValue(formatado);
  }

  aoDigitarCep(evento: Event, chave: ChaveEndereco): void {
    this.mascarar(evento, `${chave}.cep`, formatarCep);
    this.buscarCep(chave);
  }

  buscarCep(chave: ChaveEndereco): void {
    const numero = soDigitos(this.form.get(`${chave}.cep`)?.value);
    if (numero.length !== 8) return;

    this.definirStatusCep(chave, 'Buscando endereço...');
    this.cep.buscar(numero).subscribe({
      next: (e) => {
        if (e.erro) {
          this.definirStatusCep(chave, 'CEP não encontrado. Preencha o endereço manualmente.');
          return;
        }
        this.form.get(chave)?.patchValue({
          rua: e.logradouro,
          bairro: e.bairro,
          cidade: e.localidade,
          uf: e.uf,
        });
        this.definirStatusCep(chave, 'Endereço encontrado. Confira os dados antes de enviar.');
      },
      error: () =>
        this.definirStatusCep(chave, 'Não foi possível buscar o CEP agora. Preencha manualmente.'),
    });
  }

  private definirStatusCep(chave: ChaveEndereco, texto: string): void {
    this.statusCep.update((s) => ({ ...s, [chave]: texto }));
  }

  protected cidadeUf(e: { cidade: string; uf: string }): string {
    if (e.cidade && e.uf) return `${e.cidade}/${e.uf}`;
    return e.cidade || 'A informar';
  }

  aoEscolherFotos(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.adicionarFotos(Array.from(campo.files ?? []));
    campo.value = '';
  }

  aoSoltarFotos(evento: DragEvent): void {
    evento.preventDefault();
    this.adicionarFotos(Array.from(evento.dataTransfer?.files ?? []));
  }

  removerFoto(indice: number): void {
    this.fotos.update((lista) => lista.filter((_, i) => i !== indice));
    this.erroFotos.set('');
  }

  private adicionarFotos(novas: File[]): void {
    const validas = novas.filter((f) => TIPOS_ACEITOS.includes(f.type) && f.size <= TAMANHO_MAXIMO_BYTES);
    const recusadas = novas.length - validas.length;

    const total = [...this.fotos(), ...validas];
    this.fotos.set(total.slice(0, QUANTIDADE_MAXIMA_FOTOS));

    if (total.length > QUANTIDADE_MAXIMA_FOTOS) {
      this.erroFotos.set(`Máximo de ${QUANTIDADE_MAXIMA_FOTOS} fotos. As demais foram ignoradas.`);
    } else if (recusadas > 0) {
      this.erroFotos.set('Use apenas fotos JPG ou PNG de até 8 MB.');
    } else {
      this.erroFotos.set('');
    }
  }

  async enviar(continuarNoWhatsapp = false): Promise<void> {
    if (this.enviando()) return;
    this.erroEnvio.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('.campo__controle.ng-invalid')?.focus();
      return;
    }

    const abaWhatsapp = continuarNoWhatsapp ? window.open('', '_blank') : null;
    this.enviando.set(true);

    try {
      const fotos = await Promise.all(this.fotos().map((f) => reduzirImagem(f)));
      const codigo = await this.gerarCodigoUnico();
      const pedido = this.montarPedido(codigo, fotos);
      const salvo = await firstValueFrom(this.pedidos.criar(pedido));

      this.codigoGerado.set(salvo.codigo);
      this.rolagem.scrollToPosition([0, 0]);
    } catch {
      abaWhatsapp?.close();
      this.erroEnvio.set(
        'Não foi possível enviar agora. Confira se a API (npm run api) está rodando e tente de novo.',
      );
    } finally {
      this.enviando.set(false);
    }
  }

  private async gerarCodigoUnico(): Promise<string> {
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const codigo = codigoAleatorio();
      const existentes = await firstValueFrom(this.pedidos.buscarPorCodigo(codigo));
      if (existentes.length === 0) return codigo;
    }
    return `${codigoAleatorio()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
  }

  novaSolicitacao(): void {
    this.form.reset();
    this.fotos.set([]);
    this.erroFotos.set('');
    this.codigoGerado.set('');
    this.linkWhatsapp.set('');
    this.statusCep.set({ origem: '', destino: '' });
    this.rolagem.scrollToPosition([0, 0]);
  }

  protected endereco(v: ValorEndereco, comAcesso = false): Endereco {
    const base: Endereco = {
      cep: v.cep,
      rua: v.rua,
      numero: v.numero,
      complemento: v.complemento,
      bairro: v.bairro,
      cidade: v.cidade,
      uf: v.uf,
    };
    return comAcesso ? { ...base, andar: v.andar, elevador: v.elevador } : base;
  }

  protected linhaEndereco(e: Endereco): string {
    const compl = e.complemento ? `, ${e.complemento}` : '';
    return `${e.rua}, ${e.numero}${compl} - ${e.bairro}, ${e.cidade}/${e.uf} (CEP ${e.cep})`;
  }
}