import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VisualizadorImagem } from './components/visualizador-imagem/visualizador-imagem';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VisualizadorImagem],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
