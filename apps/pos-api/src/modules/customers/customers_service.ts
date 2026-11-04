import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma_service';
import { CreateCustomerDto } from './dto/create_customer_dto';
import { CustomerQueryDto } from './dto/customer_query_dto';
import { UpdateCustomerDto } from './dto/update_customer_dto';

export interface CustomerPage {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CustomerQueryDto): Promise<CustomerPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      active: query.includeInactive ? undefined : true,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { email: { contains: query.search } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    await this.assertEmailFree(dto.email);
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        taxId: dto.taxId,
        address: dto.address,
        notes: dto.notes,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);
    if (dto.email) {
      await this.assertEmailFree(dto.email, id);
    }
    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        taxId: dto.taxId,
        address: dto.address,
        notes: dto.notes,
        active: dto.active,
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findOne(id);
    const sales = await this.prisma.sale.count({ where: { customerId: id } });
    if (sales > 0) {
      // Borrado lógico: no se elimina con historial de ventas.
      await this.prisma.customer.update({
        where: { id },
        data: { active: false },
      });
      return { id };
    }
    await this.prisma.customer.delete({ where: { id } });
    return { id };
  }

  private async assertEmailFree(
    email?: string,
    ignoreId?: string,
  ): Promise<void> {
    if (!email) {
      return;
    }
    const existing = await this.prisma.customer.findFirst({
      where: { email },
    });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Ya existe un cliente con ese email');
    }
  }
}
