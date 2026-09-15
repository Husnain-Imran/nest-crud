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
    // console.log('userData', userData);
    const hashedPassword = await bcrypt.hash(
      userData.password,
      parseInt(this.configService.get<string>('SALT_ROUNDS')!),
    );

    const newUser = await this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });
    this.userRepo.save(newUser);
    return newUser;
  }
}
