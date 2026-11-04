import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  InventoryApi,
  MovementInput,
  Page,
  StockMovement,
} from '@pos/data-access';

export interface InventoryState {
  movements: StockMovement[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  movements: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(InventoryApi);

    return {
      async load(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const result: Page<StockMovement> = await api.listMovements({
            page: store.page(),
            pageSize: store.pageSize(),
          });
          patchState(store, {
            movements: result.items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            loading: false,
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudieron cargar los movimientos'),
          });
        }
      },
      async setPage(page: number): Promise<void> {
        patchState(store, { page });
        await this.load();
      },
      async save(input: MovementInput): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          await api.createMovement(input);
          patchState(store, { loading: false, page: 1 });
          await this.load();
          return true;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo registrar el movimiento'),
          });
          return false;
        }
      },
    };
  }),
  withComputed(({ total, page, pageSize, loading, error }) => ({
    totalPages: computed(() => Math.max(1, Math.ceil(total() / pageSize()))),
    isLoading: computed(() => loading()),
    loadError: computed(() => error()),
  })),
);

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
