import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { SettingsService } from './settings_service';

describe('SettingsService', () => {
  let service: SettingsService;

  const prismaMock = {
    setting: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.setting.findMany.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(SettingsService);
  });

  it('devuelve valores por defecto sin filas', async () => {
    const settings = await service.get();
    expect(settings.storeName).toBe('Mi Negocio');
    expect(settings.currency).toBe('MXN');
  });

  it('lee valores guardados', async () => {
    prismaMock.setting.findMany.mockResolvedValueOnce([
      { key: 'storeName', value: 'Tienda Central', updatedAt: new Date() },
    ]);
    const settings = await service.get();
    expect(settings.storeName).toBe('Tienda Central');
  });

  it('actualiza con upsert', async () => {
    await service.update({ storeName: 'Otra' });
    expect(prismaMock.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'storeName' },
        update: { value: 'Otra' },
      }),
    );
  });
});
