import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'pos-empty-state',
  imports: [MatIconModule],
  templateUrl: './pos_empty_state.html',
  styleUrl: './pos_empty_state.scss',
})
export class PosEmptyStateComponent {
  readonly icon = input('info');
  readonly title = input.required<string>();
  readonly message = input('');
}
