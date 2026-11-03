import { Component, input } from '@angular/core';

@Component({
  selector: 'pos-page-header',
  imports: [],
  templateUrl: './pos_page_header.html',
  styleUrl: './pos_page_header.scss',
})
export class PosPageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
