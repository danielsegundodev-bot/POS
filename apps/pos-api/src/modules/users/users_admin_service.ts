import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma_service';
import { CreateUserDto } from './dto/create_user_dto';
import { UpdateUserDto } from './dto/update_user_dto';
import { PublicUser } from './public_user';

export interface UserPage {
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class UsersAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 50): Promise<UserPage> {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count(),
    ]);
    return {
      items: users.map((user) => this.toPublic(user)),
      total,
      page,
      pageSize,
    };
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
        active: dto.active ?? true,
      },
    });
    return this.toPublic(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    await this.assertExists(id);
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }
    const data: {
      email?: string;
      name?: string;
      role?: string;
      active?: boolean;
      passwordHash?: string;
    } = {
      email: dto.email,
      name: dto.name,
      role: dto.role,
      active: dto.active,
    };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.toPublic(user);
  }

  async remove(id: string, currentUserId?: string): Promise<{ id: string }> {
    if (currentUserId && id === currentUserId) {
      throw new ConflictException('No puedes eliminar tu propia cuenta');
    }
    const user = await this.assertExists(id);
    if (user.role === 'admin') {
      const admins = await this.prisma.user.count({
        where: { role: 'admin', active: true },
      });
      if (admins <= 1) {
        throw new ConflictException('No se puede eliminar el último admin');
      }
    }
    // Borrado lógico para conservar el historial de ventas.
    await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
    return { id };
  }

  private async assertExists(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  private toPublic(
    user: User,
  ): PublicUser & { active: boolean; createdAt: string } {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
