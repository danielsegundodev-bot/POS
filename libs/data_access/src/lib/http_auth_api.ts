import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from './auth_api';
import { ApiHttp } from './api_http';
import { LoginRequest, LoginResponse } from './models/auth';

@Injectable({ providedIn: 'root' })
export class HttpAuthApi extends AuthApi {
  private readonly http = inject(ApiHttp);

  override login(request: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.http.post<LoginResponse>('auth/login', request));
  }
}
