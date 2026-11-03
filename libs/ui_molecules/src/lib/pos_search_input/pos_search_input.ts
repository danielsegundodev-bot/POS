import { Component, effect, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PosFieldComponent } from '../pos_field/pos_field';

@Component({
  selector: 'pos-search-input',
  imports: [PosFieldComponent, MatIconModule],
  templateUrl: './pos_search_input.html',
  styleUrl: './pos_search_input.scss',
})
export class PosSearchInputComponent {
  readonly label = input('Buscar');
  readonly placeholder = input('');
  readonly value = input('');
  readonly valueChange = output<string>();

  private readonly innerValue = signal('');

  constructor() {
    effect(() => this.innerValue.set(this.value()));
  }

  get currentValue(): string {
    return this.innerValue();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.innerValue.set(target.value);
    this.valueChange.emit(target.value);
  }

  clear(): void {
    this.innerValue.set('');
    this.valueChange.emit('');
  }
}
