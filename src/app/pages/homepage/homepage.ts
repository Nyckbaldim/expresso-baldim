import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './homepage.css',
  templateUrl: './homepage.html',
})
export class Homepage {}
