import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/* Cabeçalho e rodapé ficam nos layouts (PublicLayout e AdminLayout), escolhidos pela rota */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
