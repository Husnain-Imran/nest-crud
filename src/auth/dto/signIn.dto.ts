import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
export class SignInDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
