import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '@pos/data-access';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosSearchInputComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { CustomersStore } from '../customers_store';

@Component({
  selector: 'pos-customers-page',
  imports: [
    PosPageHeaderComponent,
    PosEmptyStateComponent,
    PosSearchInputComponent,
    PosButtonComponent,
  ],
  templateUrl: './customers_page.html',
  styleUrl: './customers_page.scss',
})
export class CustomersPageComponent implements OnInit {
  private readonly store = inject(CustomersStore);
  private readonly router = inject(Router);

  readonly items = this.store.items;
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly page = this.store.page;
  readonly totalPages = this.store.totalPages;
  readonly total = this.store.total;
  readonly search = this.store.search;

  ngOnInit(): void {
    void this.store.load();
  }

  createNew(): void {
    void this.router.navigate(['/clientes/nuevo']);
  }

  onSearch(term: string): void {
    void this.store.setSearch(term);
  }

  previousPage(): void {
    if (this.page() > 1) {
      void this.store.setPage(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      void this.store.setPage(this.page() + 1);
    }
  }

  edit(customer: Customer): void {
    void this.router.navigate(['/clientes', customer.id]);
  }

  async remove(customer: Customer): Promise<void> {
    const ok = window.confirm(
      `¿Eliminar o desactivar al cliente "${customer.name}"?`,
    );
    if (ok) {
      await this.store.remove(customer.id);
    }
  }
}
