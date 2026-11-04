import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { CustomersService } from './customers_service';
import { CreateCustomerDto } from './dto/create_customer_dto';

describe('CustomersService', () => {
  let service: CustomersService;

  const customer = {
    id: 'c1',
    name: 'Ana López',
    email: 'ana@example.com',
    phone: null,
    taxId: null,
    address: null,
    notes: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    customer: {
      findMany: jest.fn().mockResolvedValue([customer]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(customer),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(customer),
      update: jest.fn().mockResolvedValue(customer),
      delete: jest.fn().mockResolvedValue(customer),
    },
    sale: {
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn().mockResolvedValue([[customer], 1]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.customer.findFirst.mockResolvedValue(null);
    prismaMock.customer.findUnique.mockResolvedValue(customer);
    prismaMock.customer.count.mockResolvedValue(1);
    prismaMock.customer.findMany.mockResolvedValue([customer]);
    prismaMock.sale.count.mockResolvedValue(0);

    const module = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(CustomersService);
  });

  it('lista clientes paginados', async () => {
    const page = await service.findAll({ page: 1, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it('crea un cliente', async () => {
    const dto: CreateCustomerDto = { name: 'Ana López' };
    const created = await service.create(dto);
    expect(created.name).toBe('Ana López');
    expect(prismaMock.customer.create).toHaveBeenCalled();
  });

  it('lanza Conflict si el email ya existe', async () => {
    prismaMock.customer.findFirst.mockResolvedValueOnce({
      ...customer,
      id: 'otro',
    });
    const dto: CreateCustomerDto = {
      name: 'Otra',
      email: 'ana@example.com',
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('desactiva en vez de borrar con ventas', async () => {
    prismaMock.sale.count.mockResolvedValueOnce(3);
    await service.remove('c1');
    expect(prismaMock.customer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } }),
    );
    expect(prismaMock.customer.delete).not.toHaveBeenCalled();
  });

  it('borra sin historial de ventas', async () => {
    await service.remove('c1');
    expect(prismaMock.customer.delete).toHaveBeenCalledWith({
      where: { id: 'c1' },
    });
  });

  it('lanza NotFound al editar inexistente', async () => {
    prismaMock.customer.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
