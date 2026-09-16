import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
export class SignUpDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  role!: string;
}
