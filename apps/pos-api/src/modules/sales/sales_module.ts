import { Module } from '@nestjs/common';
import { SalesController } from './sales_controller';
import { SalesService } from './sales_service';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
