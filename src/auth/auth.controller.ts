import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { Serialize } from '../interceptor/serializeInterceptor';
import { SignupResponseDto } from './dto/signUpResponse.dto';
import { SignInResponseDto } from './dto/signInResponse.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
// @Serialize(SignInDto)
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('signin')
  @Serialize(SignInResponseDto)
  signin(@Body() signInDto: SignInDto) {
    return this.AuthService.signIn(signInDto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('signup')
  @Serialize(SignupResponseDto)
  signup(@Body() signUpDto: SignUpDto) {
    return this.AuthService.signup(signUpDto);
  }
}
