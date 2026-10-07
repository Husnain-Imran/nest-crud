import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column } from 'typeorm';

export class CreateProductDto {
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

  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  commingSoon!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  inventoryEnabled!: boolean;

  @IsNotEmpty()
  @IsNumber()
  basePrice!: number;

  @IsNotEmpty()
  @IsNumber()
  floorPrice!: number;

  @IsNotEmpty()
  @IsNumber()
  displayPrice!: number;

  @IsNotEmpty()
  @IsNumber()
  ceilingPrice!: number;
}

