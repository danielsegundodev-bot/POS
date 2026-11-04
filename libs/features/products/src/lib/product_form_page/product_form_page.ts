import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { parseMoneyToCents } from '@pos/core';
import { ProductInput } from '@pos/data-access';
import { PosButtonComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { ProductsStore } from '../products_store';

@Component({
  selector: 'pos-product-form-page',
  imports: [PosPageHeaderComponent, PosFieldComponent, PosButtonComponent],
  templateUrl: './product_form_page.html',
  styleUrl: './product_form_page.scss',
})
export class ProductFormPageComponent implements OnInit {
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private productId: string | null = null;

  readonly title = signal('Nuevo producto');
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;

  readonly sku = signal('');
  readonly name = signal('');
  readonly description = signal('');
  readonly price = signal('');
  readonly taxRate = signal(0);
  readonly trackStock = signal(false);
  readonly stock = signal(0);
  readonly active = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = id;
      this.title.set('Editar producto');
      void this.loadProduct(id);
    }
  }

  private async loadProduct(id: string): Promise<void> {
    const product = await this.store.get(id);
    if (!product) {
      return;
    }
    this.sku.set(product.sku);
    this.name.set(product.name);
    this.description.set(product.description ?? '');
    this.price.set((product.price / 100).toFixed(2));
    this.taxRate.set(product.taxRate);
    this.trackStock.set(product.trackStock);
    this.stock.set(product.stock);
    this.active.set(product.active);
  }

  setSku(event: Event): void {
    this.sku.set((event.target as HTMLInputElement).value);
  }

  setName(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  setDescription(event: Event): void {
    this.description.set((event.target as HTMLInputElement).value);
  }

  setPrice(event: Event): void {
    this.price.set((event.target as HTMLInputElement).value);
  }

  setTaxRate(event: Event): void {
    this.taxRate.set(Number((event.target as HTMLSelectElement).value));
  }

  setTrackStock(event: Event): void {
    this.trackStock.set((event.target as HTMLInputElement).checked);
  }

  setStock(event: Event): void {
    this.stock.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  setActive(event: Event): void {
    this.active.set((event.target as HTMLInputElement).checked);
  }

  cancel(): void {
    void this.router.navigate(['/productos']);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading()) {
      return;
    }

    let priceCents: number;
    try {
      priceCents = parseMoneyToCents(this.price());
    } catch {
      return;
    }

    const input: ProductInput = {
      sku: this.sku().trim(),
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      price: priceCents,
      taxRate: this.taxRate(),
      trackStock: this.trackStock(),
      stock: this.stock(),
      active: this.active(),
    };

    const ok = await this.store.save(this.productId, input);
    if (ok) {
      await this.router.navigate(['/productos']);
    }
  }
}
