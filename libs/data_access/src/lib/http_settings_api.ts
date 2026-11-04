import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp } from './api_http';
import { AppSettings, SettingsInput } from './models';
import { SettingsApi } from './settings_api';

@Injectable({ providedIn: 'root' })
export class HttpSettingsApi extends SettingsApi {
  private readonly http = inject(ApiHttp);

  override get(): Promise<AppSettings> {
    return firstValueFrom(this.http.get<AppSettings>('settings'));
  }

  override update(input: SettingsInput): Promise<AppSettings> {
    return firstValueFrom(this.http.put<AppSettings>('settings', input));
  }
}
