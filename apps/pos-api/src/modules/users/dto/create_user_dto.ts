import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(['admin', 'cashier', 'manager'])
  role!: 'admin' | 'cashier' | 'manager';

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
