import { Module } from '@nestjs/common';
import { CustomersController } from './customers_controller';
import { CustomersService } from './customers_service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
