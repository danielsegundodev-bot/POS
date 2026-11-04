import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateMovementDto } from './dto/create_movement_dto';
import { MovementQueryDto } from './dto/movement_query_dto';
import { InventoryService } from './inventory_service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  findAll(@Query() query: MovementQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Post('movements')
  create(@Body() dto: CreateMovementDto) {
    return this.inventoryService.create(dto);
  }
}
