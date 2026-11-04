import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export type MovementType = 'in' | 'out' | 'adjustment';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsIn(['in', 'out', 'adjustment'])
  type!: MovementType;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
