import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma_service';
import { UpdateSettingsDto } from './dto/update_settings_dto';

export interface AppSettings {
  storeName: string;
  storeAddress: string;
  currency: string;
  taxLabel: string;
}

const DEFAULTS: AppSettings = {
  storeName: 'Mi Negocio',
  storeAddress: '',
  currency: 'MXN',
  taxLabel: 'IVA',
};

const KEYS: (keyof AppSettings)[] = [
  'storeName',
  'storeAddress',
  'currency',
  'taxLabel',
];

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AppSettings> {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: KEYS } },
    });
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return {
      storeName: map.get('storeName') ?? DEFAULTS.storeName,
      storeAddress: map.get('storeAddress') ?? DEFAULTS.storeAddress,
      currency: map.get('currency') ?? DEFAULTS.currency,
      taxLabel: map.get('taxLabel') ?? DEFAULTS.taxLabel,
    };
  }

  async update(dto: UpdateSettingsDto): Promise<AppSettings> {
    const entries = Object.entries(dto).filter(
      ([key, value]) =>
        KEYS.includes(key as keyof AppSettings) && value !== undefined,
    ) as [keyof AppSettings, string][];

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return this.get();
  }
}
