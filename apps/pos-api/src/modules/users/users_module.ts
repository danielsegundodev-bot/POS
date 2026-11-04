import { Module } from '@nestjs/common';
import { UsersService } from './users_service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
