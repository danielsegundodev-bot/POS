import { Module } from '@nestjs/common';
import { UsersController } from './users_controller';
import { UsersAdminService } from './users_admin_service';
import { UsersService } from './users_service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersAdminService],
  exports: [UsersService],
})
export class UsersModule {}
