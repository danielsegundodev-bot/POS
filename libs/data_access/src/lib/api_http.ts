import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiError } from './api_error';
import { API_BASE_URL } from './tokens';

export type QueryParams = Record<string, string | number | boolean | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiHttp {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, params: QueryParams = {}): Observable<T> {
    return this.http
      .get<T>(this.resolve(path), { params: this.toHttpParams(params) })
      .pipe(this.normalize());
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.resolve(path), body).pipe(this.normalize());
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.resolve(path), body).pipe(this.normalize());
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.resolve(path), body).pipe(this.normalize());
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.resolve(path)).pipe(this.normalize());
  }

  private resolve(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  private toHttpParams(params: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  private normalize<T>(): (source: Observable<T>) => Observable<T> {
    return (source) =>
      source.pipe(catchError((err) => throwError(() => ApiError.from(err))));
  }
}
