import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosPageHeaderComponent } from '@pos/ui-organisms';

@Component({
  selector: 'pos-placeholder-page',
  imports: [PosPageHeaderComponent, PosEmptyStateComponent],
  template: `
    <pos-page-header [title]="title" />
    <pos-empty-state
      icon="construction"
      title="Sección en construcción"
      message="Esta parte del POS se habilitará en una fase posterior del proyecto."
    />
  `,
})
export class PlaceholderPageComponent {
  readonly title: string;

  constructor() {
    const data = inject(ActivatedRoute).snapshot.data;
    this.title = typeof data['title'] === 'string' ? data['title'] : 'POS';
  }
}
