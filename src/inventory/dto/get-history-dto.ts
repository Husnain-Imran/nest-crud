import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { paginationQueryDto } from 'src/pagination/dtos/pagination.dto';
import { StockChangeType, StockSource } from '../enums/inventory.enum';

export class GetHistoryDto extends paginationQueryDto {
  @IsOptional()
  @IsEnum(StockSource, { message: 'Invalid stock source' })
  source?: StockSource;

  @IsOptional()
  @IsEnum(StockChangeType, { message: 'Invalid stock change type' })
  changeType?: StockChangeType;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid start date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid end date' })
  endDate?: string;
}
