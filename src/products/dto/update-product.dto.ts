import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ArrayUnique, IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'initialStockQuantity',
    'lowStockThreshold',
  ] as const),
) {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  deletedImageIds?: string[];
}
