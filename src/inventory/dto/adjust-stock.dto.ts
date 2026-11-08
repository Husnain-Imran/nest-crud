import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';
import { StockChangeType, StockSource } from '../enums/inventory.enum';

export class AdjustStockDto {
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  newStock!: number;
  @IsIn([
    StockSource.ADMIN_MANUAL,
    StockSource.RESTOCK,
    StockSource.DAMAGE,
    StockSource.RETURN,
  ])
  source!: StockSource;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
