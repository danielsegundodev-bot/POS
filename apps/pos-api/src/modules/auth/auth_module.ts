import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users_module';
import { AuthController } from './auth_controller';
import { AuthGuard } from './auth_guard';
import { AuthService } from './auth_service';

const jwtSecret = process.env['JWT_SECRET'] ?? 'pos-dev-secret';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
