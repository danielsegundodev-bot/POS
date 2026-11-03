import { Component, input } from '@angular/core';

@Component({
  selector: 'pos-field',
  imports: [],
  templateUrl: './pos_field.html',
  styleUrl: './pos_field.scss',
})
export class PosFieldComponent {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
}
