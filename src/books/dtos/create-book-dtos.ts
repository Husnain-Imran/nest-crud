import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
