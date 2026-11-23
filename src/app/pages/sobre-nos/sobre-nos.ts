import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarrosselImagens } from '../../components/carrossel-imagens/carrossel-imagens';
import { LOGO_SRC } from '../../constants';
import { GALERIA_SOBRE_NOS } from '../../shared/galerias';

@Component({
  selector: 'app-sobre-nos',
  standalone: true,
  imports: [RouterLink, CarrosselImagens, NgOptimizedImage],
  templateUrl: './sobre-nos.html',
  styleUrl: './sobre-nos.css'
})
export class SobreNos {
  protected readonly galeria = GALERIA_SOBRE_NOS;
  protected readonly logo = LOGO_SRC;
}