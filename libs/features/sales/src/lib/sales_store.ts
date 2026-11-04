import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Product, Sale, SalesApi } from '@pos/data-access';

export interface CartLine {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discount: number;
  trackStock: boolean;
  stock: number;
}

export interface SalesState {
  lines: CartLine[];
  loading: boolean;
  error: string | null;
  /** Última venta cobrada (ticket). */
  lastSale: Sale | null;
}

const initialState: SalesState = {
  lines: [],
  loading: false,
  error: null,
  lastSale: null,
};

function lineSubtotal(line: CartLine): number {
  return Math.max(0, line.unitPrice * line.quantity - line.discount);
}

function lineTax(line: CartLine): number {
  return Math.round(lineSubtotal(line) * line.taxRate);
}

function lineTotal(line: CartLine): number {
  return lineSubtotal(line) + lineTax(line);
}

export const cartLineSubtotal = lineSubtotal;
export const cartLineTax = lineTax;
export const cartLineTotal = lineTotal;

export const SalesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const api = inject(SalesApi);

    return {
      addProduct(product: Product): void {
        const existing = store
          .lines()
          .find((line) => line.productId === product.id);
        if (existing) {
          if (existing.trackStock && existing.quantity >= existing.stock) {
            patchState(store, {
              error: `Stock insuficiente para "${product.name}"`,
            });
            return;
          }
          patchState(store, {
            lines: store
              .lines()
              .map((line) =>
                line.productId === product.id
                  ? { ...line, quantity: line.quantity + 1 }
                  : line,
              ),
            error: null,
          });
          return;
        }
        patchState(store, {
          lines: [
            ...store.lines(),
            {
              productId: product.id,
              sku: product.sku,
              name: product.name,
              unitPrice: product.price,
              taxRate: product.taxRate,
              quantity: 1,
              discount: 0,
              trackStock: product.trackStock,
              stock: product.stock,
            },
          ],
          error: null,
        });
      },
      setQuantity(productId: string, quantity: number): void {
        if (quantity < 1) {
          this.removeLine(productId);
          return;
        }
        patchState(store, {
          lines: store
            .lines()
            .map((line) =>
              line.productId === productId ? { ...line, quantity } : line,
            ),
        });
      },
      setDiscount(productId: string, discount: number): void {
        patchState(store, {
          lines: store
            .lines()
            .map((line) =>
              line.productId === productId
                ? { ...line, discount: Math.max(0, discount) }
                : line,
            ),
        });
      },
      removeLine(productId: string): void {
        patchState(store, {
          lines: store.lines().filter((line) => line.productId !== productId),
        });
      },
      clearCart(): void {
        patchState(store, { lines: [], error: null });
      },
      dismissTicket(): void {
        patchState(store, { lastSale: null });
      },
      async checkout(
        method: 'cash' | 'card' | 'transfer' | 'other',
        received?: number,
      ): Promise<boolean> {
        const lines = store.lines();
        if (lines.length === 0) {
          patchState(store, { error: 'El carrito está vacío' });
          return false;
        }
        patchState(store, { loading: true, error: null });
        try {
          const sale = await api.create({
            lines: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              discount: line.discount || undefined,
            })),
            payment: { method, received },
          });
          patchState(store, {
            loading: false,
            lines: [],
            lastSale: sale,
          });
          return true;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo completar la venta'),
          });
          return false;
        }
      },
    };
  }),
  withComputed(({ lines, loading, error, lastSale }) => ({
    isEmpty: computed(() => lines().length === 0),
    itemCount: computed(() =>
      lines().reduce((sum, line) => sum + line.quantity, 0),
    ),
    subtotal: computed(() =>
      lines().reduce((sum, line) => sum + lineSubtotal(line), 0),
    ),
    tax: computed(() => lines().reduce((sum, line) => sum + lineTax(line), 0)),
    total: computed(() =>
      lines().reduce((sum, line) => sum + lineTotal(line), 0),
    ),
    isLoading: computed(() => loading()),
    cartError: computed(() => error()),
    hasTicket: computed(() => lastSale() !== null),
  })),
);

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
