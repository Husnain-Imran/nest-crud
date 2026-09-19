import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptor/serializeInterceptor';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { serialize } from 'v8';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Serialize(CreateUserDto)
  @Post('signup')
  signup(@Body() createUser: CreateUserDto) {
    // console.log('createUser in controler ', createUser);
    return this.usersService.signup(createUser);
  }

  // @Serialize(User)
  @UseGuards(JwtAuthGuard)
  @Get('check')
  check(@CurrentUser() user: User) {
    console.log('user in check route', user);
    return user;
  }
}
