import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signUp.dto';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm/browser/repository/Repository.js';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}
  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async signIn(user: SignInDto) {
    // console.log('user in auth service', user);
    const foundUser = await this.userService.findByEmail(user.email);
    // console.log('foundUser', foundUser);

    if (!foundUser) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    const isPasswordValid = await bcrypt.compare(
      user.password,
      foundUser.password,
    );
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }
    return { accessToken: this.generateToken(foundUser) };
  }
  async signup(userData: SignUpDto) {
    const userExists = await this.userService.findByEmail(userData.email);
    console.log('userExists', userExists);
    if (userExists) {
      console.log('user already exists');
      return {
        success: false,
        message: 'User already exists',
      };
    }
    const hashedPassword = await bcrypt.hash(
      userData.password,
      parseInt(this.configService.get<string>('SALT_ROUNDS')!),
    );

    const user = await this.userService.signup({
      ...userData,
      password: hashedPassword,
    });
    return { success: true, user };
  }
}
