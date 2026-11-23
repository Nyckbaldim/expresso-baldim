import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';
import { LOGO_SRC, WHATSAPP_URL } from '../../constants';

@Component({
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
})
export class Footer {
  protected readonly logo = LOGO_SRC;
  protected readonly whatsappUrl = WHATSAPP_URL;
}
