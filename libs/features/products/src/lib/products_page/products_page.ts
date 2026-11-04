import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { formatMoney } from '@pos/core';
import { Product } from '@pos/data-access';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosSearchInputComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { ProductsStore } from '../products_store';

@Component({
  selector: 'pos-products-page',
  imports: [
    PosPageHeaderComponent,
    PosEmptyStateComponent,
    PosSearchInputComponent,
    PosButtonComponent,
  ],
  templateUrl: './products_page.html',
  styleUrl: './products_page.scss',
})
export class ProductsPageComponent implements OnInit {
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);

  readonly items = this.store.items;
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly page = this.store.page;
  readonly totalPages = this.store.totalPages;
  readonly total = this.store.total;
  readonly search = this.store.search;
  readonly formatMoney = formatMoney;

  ngOnInit(): void {
    void this.store.load();
  }

  createNew(): void {
    void this.router.navigate(['/productos/nuevo']);
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

  edit(product: Product): void {
    void this.router.navigate(['/productos', product.id]);
  }

  async remove(product: Product): Promise<void> {
    const ok = window.confirm(`¿Desactivar el producto "${product.name}"?`);
    if (ok) {
      await this.store.remove(product.id);
    }
  }
}
