import { Component, OnInit, inject, signal } from '@angular/core';
import { formatMoney } from '@pos/core';
import { Product, ProductsApi } from '@pos/data-access';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosFieldComponent, PosSearchInputComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import {
  CartLine,
  SalesStore,
  cartLineSubtotal,
  cartLineTax,
} from '../sales_store';

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

@Component({
  selector: 'pos-terminal-page',
  imports: [
    PosPageHeaderComponent,
    PosSearchInputComponent,
    PosEmptyStateComponent,
    PosButtonComponent,
    PosFieldComponent,
  ],
  templateUrl: './terminal_page.html',
  styleUrl: './terminal_page.scss',
})
export class TerminalPageComponent implements OnInit {
  private readonly store = inject(SalesStore);
  private readonly productsApi = inject(ProductsApi);

  readonly lines = this.store.lines;
  readonly loading = this.store.isLoading;
  readonly error = this.store.cartError;
  readonly subtotal = this.store.subtotal;
  readonly tax = this.store.tax;
  readonly total = this.store.total;
  readonly itemCount = this.store.itemCount;
  readonly hasTicket = this.store.hasTicket;
  readonly lastSale = this.store.lastSale;

  readonly products = signal<Product[]>([]);
  readonly productsLoading = signal(true);
  readonly paymentMethod = signal<PaymentMethod>('cash');
  readonly receivedText = signal('');

  readonly formatMoney = formatMoney;
  readonly lineSubtotal = cartLineSubtotal;
  readonly lineTax = cartLineTax;

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'other', label: 'Otro' },
  ];

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
    } finally {
      this.productsLoading.set(false);
    }
  }

  onSearch(term: string): void {
    void this.refresh(term);
  }

  private async refresh(search: string): Promise<void> {
    this.productsLoading.set(true);
    try {
      const page = await this.productsApi.list({
        search: search || undefined,
        includeInactive: false,
        pageSize: 100,
      });
      this.products.set(page.items);
    } finally {
      this.productsLoading.set(false);
    }
  }

  add(product: Product): void {
    this.store.addProduct(product);
  }

  setQuantity(line: CartLine, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    this.store.setQuantity(line.productId, value);
  }

  setDiscount(line: CartLine, event: Event): void {
    const text = (event.target as HTMLInputElement).value || '0';
    const cents = Math.round(Number(text.replace(',', '.')) * 100) || 0;
    this.store.setDiscount(line.productId, cents);
  }

  remove(line: CartLine): void {
    this.store.removeLine(line.productId);
  }

  clear(): void {
    this.store.clearCart();
    this.receivedText.set('');
  }

  setMethod(event: Event): void {
    this.paymentMethod.set(
      (event.target as HTMLSelectElement).value as PaymentMethod,
    );
  }

  setReceived(event: Event): void {
    this.receivedText.set((event.target as HTMLInputElement).value);
  }

  changeDue(): number {
    if (this.paymentMethod() !== 'cash') {
      return 0;
    }
    const received = this.toCents(this.receivedText());
    return Math.max(0, received - this.total());
  }

  private toCents(text: string): number {
    const normalized = text.trim().replace(/\s/g, '').replace(',', '.');
    const value = Number(normalized);
    return Number.isNaN(value) ? 0 : Math.round(value * 100);
  }

  canPay(): boolean {
    if (this.loading() || this.lines().length === 0) {
      return false;
    }
    if (this.paymentMethod() === 'cash') {
      return this.toCents(this.receivedText()) >= this.total();
    }
    return true;
  }

  async pay(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canPay()) {
      return;
    }
    const method = this.paymentMethod();
    const received =
      method === 'cash' ? this.toCents(this.receivedText()) : undefined;
    const ok = await this.store.checkout(method, received);
    if (ok) {
      this.receivedText.set('');
    }
  }

  newSale(): void {
    this.store.dismissTicket();
    this.clear();
  }
}
