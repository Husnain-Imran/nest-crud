import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
export class paginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(10)
  limit: number = 10;
}
