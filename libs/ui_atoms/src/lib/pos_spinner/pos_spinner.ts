import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'pos-spinner',
  imports: [MatProgressSpinnerModule],
  template: `<mat-spinner [diameter]="diameter()" />`,
})
export class PosSpinnerComponent {
  readonly diameter = input(40);
}
