import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  isNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { DiscountType } from '../enums/product.enum';

export class CreateDiscountDto {
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimumDiscountQuantity: number = 1;

  @ValidateIf((o) => o.noUpperLimit === false)
  @IsInt()
  @Min(1)
  maximumDiscountQuantity?: number;

  @IsBoolean()
  noUpperLimit!: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount!: number;
}
