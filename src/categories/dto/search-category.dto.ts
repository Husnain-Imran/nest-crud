import { IsOptional, IsString } from 'class-validator';
import { paginationQueryDto } from 'src/pagination/dtos/pagination.dto';

export class SearchCategoryDto extends paginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
