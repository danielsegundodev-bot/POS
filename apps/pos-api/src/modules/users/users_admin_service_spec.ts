import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { UsersAdminService } from './users_admin_service';
import { CreateUserDto } from './dto/create_user_dto';

describe('UsersAdminService', () => {
  let service: UsersAdminService;

  const admin = {
    id: 'u-admin',
    email: 'admin@pos.local',
    name: 'Admin',
    passwordHash: 'hash',
    role: 'admin',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cashier = {
    ...admin,
    id: 'u-cashier',
    email: 'cashier@pos.local',
    name: 'Cajero',
    role: 'cashier',
  };

  const prismaMock = {
    user: {
      findMany: jest.fn().mockResolvedValue([admin]),
      findUnique: jest.fn().mockResolvedValue(admin),
      count: jest.fn().mockResolvedValue(2),
      create: jest.fn().mockResolvedValue(cashier),
      update: jest.fn().mockResolvedValue(cashier),
    },
    $transaction: jest.fn().mockResolvedValue([[admin], 2]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockResolvedValue(admin);
    prismaMock.user.count.mockResolvedValue(2);
    prismaMock.user.findMany.mockResolvedValue([admin]);
    prismaMock.$transaction.mockResolvedValue([[admin], 2]);

    const module = await Test.createTestingModule({
      providers: [
        UsersAdminService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(UsersAdminService);
  });

  it('lista usuarios públicos', async () => {
    const page = await service.findAll();
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).not.toHaveProperty('passwordHash');
  });

  it('crea usuario con email libre', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      ...cashier,
      email: 'nuevo@pos.local',
    });
    const dto: CreateUserDto = {
      email: 'nuevo@pos.local',
      name: 'Nuevo',
      password: 'secret1',
      role: 'cashier',
    };
    const created = await service.create(dto);
    expect(created.email).toBe('nuevo@pos.local');
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it('lanza Conflict si el email ya existe', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...admin,
      id: 'otro',
    });
    const dto: CreateUserDto = {
      email: 'admin@pos.local',
      name: 'X',
      password: 'secret1',
      role: 'cashier',
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('impide eliminar la propia cuenta', async () => {
    await expect(service.remove('u-admin', 'u-admin')).rejects.toThrow(
      ConflictException,
    );
  });

  it('impide eliminar el último admin', async () => {
    prismaMock.user.count.mockResolvedValueOnce(1);
    await expect(service.remove('u-admin', 'u-other')).rejects.toThrow(
      ConflictException,
    );
  });

  it('desactiva usuario sin borrarlo', async () => {
    prismaMock.user.findUnique.mockResolvedValue(cashier);
    await service.remove('u-cashier', 'u-admin');
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } }),
    );
  });

  it('lanza NotFound al editar inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
