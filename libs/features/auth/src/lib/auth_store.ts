import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { StorageService } from '@pos/core';
import { AuthApi, AuthUser } from '@pos/data-access';

export type AuthStatus = 'anonymous' | 'authenticating' | 'authenticated';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
}

const SESSION_KEY = 'session';

interface StoredSession {
  token: string;
  user: AuthUser;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'anonymous',
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authApi = inject(AuthApi);
    const storage = inject(StorageService);

    return {
      async login(email: string, password: string): Promise<boolean> {
        patchState(store, { status: 'authenticating', error: null });
        try {
          const result = await authApi.login({ email, password });
          const session: StoredSession = {
            token: result.accessToken,
            user: result.user,
          };
          storage.set(SESSION_KEY, session);
          patchState(store, {
            status: 'authenticated',
            token: result.accessToken,
            user: result.user,
          });
          return true;
        } catch (error) {
          patchState(store, {
            status: 'anonymous',
            error:
              error instanceof Error
                ? error.message
                : 'No se pudo iniciar sesión',
          });
          return false;
        }
      },
      logout(): void {
        storage.remove(SESSION_KEY);
        patchState(store, {
          status: 'anonymous',
          token: null,
          user: null,
          error: null,
        });
      },
    };
  }),
  withComputed(({ token, user, status, error }) => ({
    isAuthenticated: computed(() => status() === 'authenticated' && !!token()),
    displayName: computed(() => user()?.name ?? ''),
    isLoading: computed(() => status() === 'authenticating'),
    loginError: computed(() => error()),
  })),
  withHooks({
    onInit(store) {
      const storage = inject(StorageService);
      const session = storage.get<StoredSession>(SESSION_KEY);
      if (session?.token && session.user) {
        patchState(store, {
          status: 'authenticated',
          token: session.token,
          user: session.user,
        });
      }
    },
  }),
);
