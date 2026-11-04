import { Module } from '@nestjs/common';
import { InventoryController } from './inventory_controller';
import { InventoryService } from './inventory_service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
