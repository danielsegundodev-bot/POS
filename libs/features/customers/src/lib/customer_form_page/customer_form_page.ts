import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerInput } from '@pos/data-access';
import { PosButtonComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { CustomersStore } from '../customers_store';

@Component({
  selector: 'pos-customer-form-page',
  imports: [PosPageHeaderComponent, PosFieldComponent, PosButtonComponent],
  templateUrl: './customer_form_page.html',
  styleUrl: './customer_form_page.scss',
})
export class CustomerFormPageComponent implements OnInit {
  private readonly store = inject(CustomersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private customerId: string | null = null;

  readonly title = signal('Nuevo cliente');
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly taxId = signal('');
  readonly address = signal('');
  readonly notes = signal('');
  readonly active = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerId = id;
      this.title.set('Editar cliente');
      void this.loadCustomer(id);
    }
  }

  private async loadCustomer(id: string): Promise<void> {
    const customer = await this.store.get(id);
    if (!customer) {
      return;
    }
    this.name.set(customer.name);
    this.email.set(customer.email ?? '');
    this.phone.set(customer.phone ?? '');
    this.taxId.set(customer.taxId ?? '');
    this.address.set(customer.address ?? '');
    this.notes.set(customer.notes ?? '');
    this.active.set(customer.active);
  }

  setName(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  setEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  setPhone(event: Event): void {
    this.phone.set((event.target as HTMLInputElement).value);
  }

  setTaxId(event: Event): void {
    this.taxId.set((event.target as HTMLInputElement).value);
  }

  setAddress(event: Event): void {
    this.address.set((event.target as HTMLInputElement).value);
  }

  setNotes(event: Event): void {
    this.notes.set((event.target as HTMLInputElement).value);
  }

  setActive(event: Event): void {
    this.active.set((event.target as HTMLInputElement).checked);
  }

  cancel(): void {
    void this.router.navigate(['/clientes']);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading()) {
      return;
    }

    const input: CustomerInput = {
      name: this.name().trim(),
      email: this.email().trim() || undefined,
      phone: this.phone().trim() || undefined,
      taxId: this.taxId().trim() || undefined,
      address: this.address().trim() || undefined,
      notes: this.notes().trim() || undefined,
      active: this.active(),
    };

    const ok = await this.store.save(this.customerId, input);
    if (ok) {
      await this.router.navigate(['/clientes']);
    }
  }
}
