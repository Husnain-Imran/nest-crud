import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptor/serializeInterceptor';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Serialize(CreateUserDto)
  @Post('signup')
  signup(@Body() createUser: CreateUserDto) {
    // console.log('createUser in controler ', createUser);
    return this.usersService.signup(createUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  check() {
    return { message: 'User is authenticated' };
  }
}
