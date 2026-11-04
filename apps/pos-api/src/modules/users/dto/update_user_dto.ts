import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create_user_dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
