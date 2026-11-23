import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';
import { WHATSAPP_URL } from '../../constants';

@Component({
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
  standalone: true,
  imports: [RouterLink],
})
export class Footer {
  protected readonly whatsappUrl = WHATSAPP_URL;
}
