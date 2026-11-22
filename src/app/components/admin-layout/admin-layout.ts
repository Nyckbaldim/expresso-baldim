import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LOGO_SRC } from '../../constants';
import { Autenticacao } from '../../services/autenticacao';

/** Cabeçalho e rodapé simplificados (variante "Simplificada" do Figma) para todas as telas /admin. */
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  selector: 'eb-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly roteador = inject(Router);
  private readonly autenticacao = inject(Autenticacao);
  protected readonly logo = LOGO_SRC;
  protected readonly year = new Date().getFullYear();

  protected voltarAoSite(): void {
    this.autenticacao.sair(false);
    void this.roteador.navigateByUrl('/');
  }
}
