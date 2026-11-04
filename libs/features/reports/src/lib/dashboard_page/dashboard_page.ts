import { Component, OnInit, inject } from '@angular/core';
import { formatMoney } from '@pos/core';
import { PosButtonComponent, PosEmptyStateComponent } from '@pos/ui-atoms';
import { PosFieldComponent } from '@pos/ui-molecules';
import { PosPageHeaderComponent } from '@pos/ui-organisms';
import { ReportsStore } from '../reports_store';

@Component({
  selector: 'pos-dashboard-page',
  imports: [
    PosPageHeaderComponent,
    PosEmptyStateComponent,
    PosButtonComponent,
    PosFieldComponent,
  ],
  templateUrl: './dashboard_page.html',
  styleUrl: './dashboard_page.scss',
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(ReportsStore);

  readonly totals = this.store.totals;
  readonly byDay = this.store.byDay;
  readonly byProduct = this.store.byProduct;
  readonly byPayment = this.store.byPayment;
  readonly loading = this.store.isLoading;
  readonly error = this.store.loadError;
  readonly hasData = this.store.hasData;
  readonly from = this.store.from;
  readonly to = this.store.to;

  readonly formatMoney = formatMoney;

  readonly paymentLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    other: 'Otro',
  };

  ngOnInit(): void {
    void this.store.load();
  }

  setFrom(event: Event): void {
    this.store.setFrom((event.target as HTMLInputElement).value);
  }

  setTo(event: Event): void {
    this.store.setTo((event.target as HTMLInputElement).value);
  }

  apply(): void {
    void this.store.applyRange();
  }

  clear(): void {
    this.store.clearRange();
  }
}
