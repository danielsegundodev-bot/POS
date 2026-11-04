import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MovementType, StockMovement } from '@pos/data-access';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { InventoryStore } from '../inventory_store';

@Component({
  selector: 'pos-inventory-page',
  imports: [PosPageHeaderComponent, PosEmptyStateComponent, PosButtonComponent],
  templateUrl: './movements_page.html',
  styleUrl: './movements_page.scss',
})
export class MovementsPageComponent implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);

  readonly movements = this.store.movements;
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly page = this.store.page;
  readonly totalPages = this.store.totalPages;
  readonly total = this.store.total;

  readonly typeLabels: Record<MovementType, string> = {
    in: 'Entrada',
    out: 'Salida',
    adjustment: 'Ajuste',
  };

  ngOnInit(): void {
    void this.store.load();
  }

  createNew(): void {
    void this.router.navigate(['/inventario/nuevo']);
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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  signedQuantity(movement: StockMovement): string {
    if (movement.type === 'in') return `+${movement.quantity}`;
    if (movement.type === 'out') return `−${movement.quantity}`;
    return String(movement.quantity);
  }
}
