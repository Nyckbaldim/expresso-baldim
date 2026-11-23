import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WHATSAPP_URL } from '../../constants';

@Component({
  imports: [RouterLink],
  selector: 'app-orcamento',
  styleUrl: './orcamento.css',
  templateUrl: './orcamento.html',
})
export class Orcamento {
  protected readonly whatsappUrl = WHATSAPP_URL;
}
