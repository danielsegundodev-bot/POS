import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  AppSettings,
  PublicUser,
  SettingsApi,
  SettingsInput,
  UserInput,
  UsersAdminApi,
} from '@pos/data-access';

export interface SettingsState {
  settings: AppSettings | null;
  users: PublicUser[];
  loading: boolean;
  error: string | null;
  usersLoading: boolean;
  usersError: string | null;
}

const initialState: SettingsState = {
  settings: null,
  users: [],
  loading: false,
  error: null,
  usersLoading: false,
  usersError: null,
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const settingsApi = inject(SettingsApi);
    const usersApi = inject(UsersAdminApi);

    return {
      async loadSettings(): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const settings = await settingsApi.get();
          patchState(store, { settings, loading: false });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo cargar la configuración'),
          });
        }
      },
      async saveSettings(input: SettingsInput): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          const settings = await settingsApi.update(input);
          patchState(store, { settings, loading: false });
          return true;
        } catch (error) {
          patchState(store, {
            loading: false,
            error: toMessage(error, 'No se pudo guardar la configuración'),
          });
          return false;
        }
      },
      async loadUsers(): Promise<void> {
        patchState(store, { usersLoading: true, usersError: null });
        try {
          const users = await usersApi.list();
          patchState(store, { users, usersLoading: false });
        } catch (error) {
          patchState(store, {
            usersLoading: false,
            usersError: toMessage(error, 'No se pudieron cargar los usuarios'),
          });
        }
      },
      async saveUser(id: string | null, input: UserInput): Promise<boolean> {
        patchState(store, { usersLoading: true, usersError: null });
        try {
          if (id) {
            await usersApi.update(id, input);
          } else {
            await usersApi.create(input);
          }
          patchState(store, { usersLoading: false });
          await this.loadUsers();
          return true;
        } catch (error) {
          patchState(store, {
            usersLoading: false,
            usersError: toMessage(error, 'No se pudo guardar el usuario'),
          });
          return false;
        }
      },
      async removeUser(id: string): Promise<boolean> {
        patchState(store, { usersLoading: true, usersError: null });
        try {
          await usersApi.remove(id);
          patchState(store, { usersLoading: false });
          await this.loadUsers();
          return true;
        } catch (error) {
          patchState(store, {
            usersLoading: false,
            usersError: toMessage(error, 'No se pudo eliminar el usuario'),
          });
          return false;
        }
      },
    };
  }),
  withComputed(
    ({ settings, users, loading, error, usersLoading, usersError }) => ({
      storeName: computed(() => settings()?.storeName ?? ''),
      isLoading: computed(() => loading()),
      loadError: computed(() => error()),
      usersList: computed(() => users()),
      usersLoadingState: computed(() => usersLoading()),
      usersLoadError: computed(() => usersError()),
    }),
  ),
);

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
