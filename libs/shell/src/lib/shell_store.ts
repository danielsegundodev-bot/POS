import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export interface ShellState {
  sidenavOpen: boolean;
}

const initialState: ShellState = {
  sidenavOpen: true,
};

export const ShellStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSidenavOpen(open: boolean): void {
      patchState(store, { sidenavOpen: open });
    },
    toggleSidenav(): void {
      patchState(store, ({ sidenavOpen }) => ({ sidenavOpen: !sidenavOpen }));
    },
  })),
  withComputed(({ sidenavOpen }) => ({
    isSidenavOpen: computed(() => sidenavOpen()),
  })),
);
