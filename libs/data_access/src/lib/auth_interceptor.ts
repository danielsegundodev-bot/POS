import { HttpInterceptorFn } from '@angular/common/http';

const SESSION_STORAGE_KEY = 'pos:session';

interface StoredSession {
  token: string;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw === null) {
    return next(req);
  }
  try {
    const session = JSON.parse(raw) as StoredSession;
    if (!session.token) {
      return next(req);
    }
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${session.token}` },
      }),
    );
  } catch {
    return next(req);
  }
};
