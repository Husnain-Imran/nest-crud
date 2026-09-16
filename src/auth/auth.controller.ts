import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { Serialize } from 'src/interceptor/serializeInterceptor';
import { SignupResponseDto } from './dto/signUpResponse.dto';
import { SignInResponseDto } from './dto/signInResponse.dto';

@Controller('auth')
// @Serialize(SignInDto)
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}
  @Post('signin')
  @Serialize(SignInResponseDto)
  signin(@Body() signInDto: SignInDto) {
    return this.AuthService.signIn(signInDto);
  }

  @Post('signup')
  @Serialize(SignInResponseDto)
  signup(@Body() signUpDto: SignUpDto) {
    return this.AuthService.signup(signUpDto);
  }
}
