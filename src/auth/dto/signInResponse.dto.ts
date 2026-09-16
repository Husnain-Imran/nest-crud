import { Expose } from 'class-transformer';

export class SignInResponseDto {
  @Expose()
  success!: boolean;

  @Expose()
  message?: string;

  @Expose()
  accessToken?: string;
}
