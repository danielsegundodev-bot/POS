import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'accent' | 'basic';

@Component({
  selector: 'pos-button',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './pos_button.html',
  styleUrl: './pos_button.scss',
})
export class PosButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly pressed = output<Event>();

  readonly disabledState = (): boolean => this.disabled() || this.loading();

  emitPress(event: Event): void {
    this.pressed.emit(event);
  }
}
