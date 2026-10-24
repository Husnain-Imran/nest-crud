import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'initialStockQuantity',
    'lowStockThreshold',
  ] as const),
) {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString()
  deletedImageKeys?: string[];
}
