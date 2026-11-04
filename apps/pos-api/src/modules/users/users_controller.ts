import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create_user_dto';
import { UpdateUserDto } from './dto/update_user_dto';
import { UsersAdminService } from './users_admin_service';

interface AuthedRequest extends Request {
  user?: { sub: string; email: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersAdmin: UsersAdminService) {}

  @Get()
  findAll(@Query('page') page?: string) {
    return this.usersAdmin.findAll(Number(page) || 1);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersAdmin.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersAdmin.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.usersAdmin.remove(id, req.user?.sub);
  }
}
