import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateSaleDto, SaleQueryDto } from './dto/create_sale_dto';
import { SalesService } from './sales_service';

interface AuthedRequest extends Request {
  user?: { sub: string; email: string };
}

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(@Query() query: SaleQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSaleDto, @Req() req: AuthedRequest) {
    return this.salesService.create(dto, req.user?.sub);
  }
}
