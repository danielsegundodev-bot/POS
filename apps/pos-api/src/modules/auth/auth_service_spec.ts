import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth_service';
import { UsersService } from '../users/users_service';

describe('AuthService', () => {
  let service: AuthService;
  const user: User = {
    id: 'u1',
    email: 'admin@pos.local',
    name: 'Administrador',
    passwordHash: '',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    user.passwordHash = await bcrypt.hash('Admin123!', 10);
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(user),
            findById: jest.fn().mockResolvedValue(user),
            toPublicUser: jest.fn().mockReturnValue({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token-123'),
          },
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('devuelve token y usuario con credenciales válidas', async () => {
    const result = await service.login('admin@pos.local', 'Admin123!');
    expect(result.accessToken).toBe('token-123');
    expect(result.user.email).toBe('admin@pos.local');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('lanza UnauthorizedException con contraseña incorrecta', async () => {
    await expect(service.login('admin@pos.local', 'mala')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('lanza UnauthorizedException con usuario inexistente', async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            toPublicUser: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();
    const other = module.get(AuthService);
    await expect(other.login('nada@x.com', '123456')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
