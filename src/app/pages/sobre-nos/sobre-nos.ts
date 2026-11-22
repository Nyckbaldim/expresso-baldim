import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';

@Component({
  selector: 'app-sobre-nos',
  standalone: true,
  imports: [RouterLink, ImagemAmpliavelDirective],
  templateUrl: './sobre-nos.html',
  styleUrl: './sobre-nos.css'
})
export class SobreNos {}