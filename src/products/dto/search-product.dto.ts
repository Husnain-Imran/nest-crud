import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { paginationQueryDto } from 'src/pagination/dtos/pagination.dto';

export class SearchProductDto extends paginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  inventoryEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categoryId?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  productTypeId?: string[];
}
