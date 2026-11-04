import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app_controller';
import { AppService } from './app_service';
import { AuthModule } from '../modules/auth/auth_module';
import { PrismaModule } from '../modules/prisma/prisma_module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
