import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  async signup(userData: CreateUserDto) {
    const newUser = await this.userRepo.create(userData);
    this.userRepo.save(newUser);
    return newUser;
  }
  async findByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    console.log('user in user service', user);
    return user;
  }
}
