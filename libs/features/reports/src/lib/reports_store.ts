import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { DashboardReport, ReportsApi, ReportQuery } from '@pos/data-access';

export interface ReportsState {
  report: DashboardReport | null;
  loading: boolean;
  error: string | null;
  from: string;
  to: string;
}

const initialState: ReportsState = {
  report: null,
  loading: false,
  error: null,
  from: '',
  to: '',
};

export const ReportsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ReportsApi);

    return {
      async load(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const query: ReportQuery = {
            from: store.from() || undefined,
            to: store.to() || undefined,
          };
          const report = await api.dashboard(query);
          patchState(store, { report, loading: false });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo cargar el reporte'),
          });
        }
      },
      setFrom(from: string): void {
        patchState(store, { from });
      },
      setTo(to: string): void {
        patchState(store, { to });
      },
      async applyRange(): Promise<void> {
        await this.load();
      },
      clearRange(): void {
        patchState(store, { from: '', to: '' });
        void this.load();
      },
    };
  }),
  withComputed(({ report, loading, error }) => ({
    totals: computed(() => report()?.totals ?? null),
    byDay: computed(() => report()?.byDay ?? []),
    byProduct: computed(() => report()?.byProduct ?? []),
    byPayment: computed(() => report()?.byPayment ?? []),
    isLoading: computed(() => loading()),
    loadError: computed(() => error()),
    hasData: computed(() => (report()?.totals.tickets ?? 0) > 0),
  })),
);

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
