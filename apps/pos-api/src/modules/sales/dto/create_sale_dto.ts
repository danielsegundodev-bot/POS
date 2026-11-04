import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleLineDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  /** Descuento total de la línea en centavos. */
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;
}

export class PaymentDto {
  @IsIn(['cash', 'card', 'transfer', 'other'])
  method!: 'cash' | 'card' | 'transfer' | 'other';

  /** Importe recibido en efectivo en centavos; requerido para cash. */
  @IsOptional()
  @IsInt()
  @Min(0)
  received?: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  lines!: SaleLineDto[];

  @ValidateNested()
  @Type(() => PaymentDto)
  payment!: PaymentDto;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class SaleQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
