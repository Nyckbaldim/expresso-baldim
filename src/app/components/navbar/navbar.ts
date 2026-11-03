import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  navLinks = [
    { label: 'Início', path: '' },
    { label: 'Frota e Serviços', path: 'frota-e-servicos' },
    { label: 'Sobre Nós', path: 'sobre-nos' },
    { label: 'Orçamento', path: 'orcamento' },
    { label: 'Avaliações', path: 'avaliacoes' }
  ];
}