import { IsOptional, IsString } from 'class-validator';

export class ReportQueryDto {
  /** ISO date (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  from?: string;

  /** ISO date (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  to?: string;
}
