import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SignupResponseDto {
  @Expose()
  @IsBoolean()
  success?: boolean;

  @Expose()
  message?: string;

  @Expose()
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
