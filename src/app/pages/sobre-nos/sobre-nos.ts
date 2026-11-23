import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarrosselImagens } from '../../components/carrossel-imagens/carrossel-imagens';
import { GALERIA_SOBRE_NOS } from '../../shared/galerias';

@Component({
  selector: 'app-sobre-nos',
  standalone: true,
  imports: [RouterLink, CarrosselImagens],
  templateUrl: './sobre-nos.html',
  styleUrl: './sobre-nos.css'
})
export class SobreNos {
  protected readonly galeria = GALERIA_SOBRE_NOS;
}