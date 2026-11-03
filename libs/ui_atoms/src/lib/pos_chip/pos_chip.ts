import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'pos-chip',
  imports: [MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './pos_chip.html',
})
export class PosChipComponent {
  readonly label = input.required<string>();
  readonly removable = input(false);
  readonly removed = output<void>();

  emitRemoved(): void {
    this.removed.emit();
  }
}
