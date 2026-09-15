import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptor/serializeInterceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Serialize(CreateUserDto)
  @Post('signup')
  signup(@Body() createUser: CreateUserDto) {
    // console.log('createUser in controler ', createUser);
    return this.usersService.signup(createUser);
  }
}
