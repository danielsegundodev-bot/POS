import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  storeAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  taxLabel?: string;
}
