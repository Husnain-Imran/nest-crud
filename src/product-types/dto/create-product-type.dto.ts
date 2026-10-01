import { IsNotEmpty, IsString } from 'class-validator';
import { paginationQueryDto } from 'src/pagination/dtos/pagination.dto';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
