import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Page, Product, ProductInput, ProductsApi } from '@pos/data-access';

export interface ProductsState {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  search: string;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
  search: '',
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(ProductsApi);

    return {
      async load(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const result: Page<Product> = await api.list({
            search: store.search() || undefined,
            page: store.page(),
            pageSize: store.pageSize(),
          });
          patchState(store, {
            items: result.items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            loading: false,
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudieron cargar los productos'),
          });
        }
      },
      async setSearch(search: string): Promise<void> {
        patchState(store, { search, page: 1 });
        await this.load();
      },
      async setPage(page: number): Promise<void> {
        patchState(store, { page });
        await this.load();
      },
      async get(id: string): Promise<Product | null> {
        patchState(store, { loading: true, error: null });
        try {
          const product = await api.get(id);
          patchState(store, { loading: false });
          return product;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo cargar el producto'),
          });
          return null;
        }
      },
      async save(id: string | null, input: ProductInput): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          if (id) {
            await api.update(id, input);
          } else {
            await api.create(input);
          }
          patchState(store, { loading: false });
          return true;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo guardar el producto'),
          });
          return false;
        }
      },
      async remove(id: string): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          await api.remove(id);
          patchState(store, { loading: false });
          await this.load();
          return true;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo eliminar el producto'),
          });
          return false;
        }
      },
    };
  }),
  withComputed(({ items, total, page, pageSize, loading, error }) => ({
    hasItems: computed(() => items().length > 0),
    totalPages: computed(() => Math.max(1, Math.ceil(total() / pageSize()))),
    isLoading: computed(() => loading()),
    loadError: computed(() => error()),
  })),
);

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
