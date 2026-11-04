import { Module } from '@nestjs/common';
import { ProductsController } from './products_controller';
import { ProductsService } from './products_service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
