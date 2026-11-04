import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MovementType, Product, ProductsApi } from '@pos/data-access';
import { PosButtonComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { InventoryStore } from '../inventory_store';

@Component({
  selector: 'pos-movement-form-page',
  imports: [PosPageHeaderComponent, PosFieldComponent, PosButtonComponent],
  templateUrl: './movement_form_page.html',
  styleUrl: './movement_form_page.scss',
})
export class MovementFormPageComponent implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly productsApi = inject(ProductsApi);
  private readonly router = inject(Router);

  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly products = signal<Product[]>([]);
  readonly productsLoading = signal(true);

  readonly productId = signal('');
  readonly type = signal<MovementType>('in');
  readonly quantity = signal(1);
  readonly reason = signal('');

  ngOnInit(): void {
    void this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    this.productsLoading.set(true);
    try {
      const page = await this.productsApi.list({
        includeInactive: false,
        pageSize: 100,
      });
      this.products.set(page.items);
      if (page.items.length > 0 && !this.productId()) {
        this.productId.set(page.items[0].id);
      }
    } finally {
      this.productsLoading.set(false);
    }
  }

  setProductId(event: Event): void {
    this.productId.set((event.target as HTMLSelectElement).value);
  }

  setType(event: Event): void {
    this.type.set((event.target as HTMLSelectElement).value as MovementType);
  }

  setQuantity(event: Event): void {
    this.quantity.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  setReason(event: Event): void {
    this.reason.set((event.target as HTMLInputElement).value);
  }

  cancel(): void {
    void this.router.navigate(['/inventario']);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading() || !this.productId()) {
      return;
    }
    const ok = await this.store.save({
      productId: this.productId(),
      type: this.type(),
      quantity: this.quantity(),
      reason: this.reason().trim() || undefined,
    });
    if (ok) {
      await this.router.navigate(['/inventario']);
    }
  }
}
