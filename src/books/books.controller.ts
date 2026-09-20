import { BooksService } from './books.service';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { CreateBookDto } from './dtos/create-book-dtos';
import { Roles } from 'src/users/decorators/role.decorator';
import { Role } from 'src/users/enums/Role.enum';
import { updateBookDto } from './dtos/update-book-dtos';
import { QueryBookDto } from './dtos/query-book.dto';

@Controller('books')
export class BooksController {
  constructor(private BooksService: BooksService) {}
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Post('create')
  create(@Body() CreateBookDto: CreateBookDto, @CurrentUser() user: User) {
    return this.BooksService.createBook(CreateBookDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: updateBookDto) {
    return this.BooksService.updateBook(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.BooksService.delete(id);
  }
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.User)
  @Get()
  findAll(@Query() query: QueryBookDto) {
    return this.BooksService.findAll(query);
  }
}
