import { AppSettings, SettingsInput } from './models';

export abstract class SettingsApi {
  abstract get(): Promise<AppSettings>;
  abstract update(input: SettingsInput): Promise<AppSettings>;
}
