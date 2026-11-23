import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LOGO_SRC } from '../../constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly logo = LOGO_SRC;

  navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Frota e Serviços', path: '/frota-e-servicos' },
    { label: 'Sobre Nós', path: '/sobre-nos' },
    { label: 'Orçamento', path: '/orcamento' },
    { label: 'Avaliar', path: '/avaliar' },
    { label: 'Rastrear pedido', path: '/rastrear-pedido' }
  ];
}