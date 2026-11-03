import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx_welcome';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'pos-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'pos-web';
}
