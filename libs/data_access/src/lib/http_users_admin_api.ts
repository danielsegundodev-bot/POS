import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp } from './api_http';
import { Page, PublicUser, UserInput } from './models';
import { UsersAdminApi } from './users_admin_api';

@Injectable({ providedIn: 'root' })
export class HttpUsersAdminApi extends UsersAdminApi {
  private readonly http = inject(ApiHttp);

  override async list(): Promise<PublicUser[]> {
    const page = await firstValueFrom(this.http.get<Page<PublicUser>>('users'));
    return page.items;
  }

  override create(input: UserInput): Promise<PublicUser> {
    return firstValueFrom(this.http.post<PublicUser>('users', input));
  }

  override update(id: string, input: UserInput): Promise<PublicUser> {
    return firstValueFrom(this.http.patch<PublicUser>(`users/${id}`, input));
  }

  override remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`users/${id}`));
  }
}
