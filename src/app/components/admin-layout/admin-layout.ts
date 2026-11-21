import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { LOGO_SRC } from '../../constants';

/** Cabeçalho e rodapé simplificados (variante "Simplificada" do Figma) para todas as telas /admin. */
@Component({
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  selector: 'eb-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly logo = LOGO_SRC;
  protected readonly year = new Date().getFullYear();
}
