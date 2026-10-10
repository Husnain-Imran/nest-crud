import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateDiscountDto } from './create.disocunt.dto';
export class CreateProductDto {
  // basic product details
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  vialSize?: string;

  @IsOptional()
  @IsString()
  concentration?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  // flags for product status

  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  commingSoon!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  inventoryEnabled!: boolean;

  // pricing details

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  floorPrice!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  displayPrice!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ceilingPrice!: number;

  // inventory and discount details

  @ValidateIf((o) => o.inventoryEnabled === true)
  @IsInt()
  @Min(0)
  initialStockQuantity!: number;

  @ValidateIf((o) => o.inventoryEnabled === true)
  @IsInt()
  @Min(0)
  lowStockThreshold!: number;

  // relations

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  categoryIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  productTypeIds!: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDiscountDto)
  discounts?: CreateDiscountDto[];
}
