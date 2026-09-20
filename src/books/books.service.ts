import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entity/book.entity';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dtos/create-book-dtos';
import { User } from 'src/users/entities/user.entity';
import { updateBookDto } from './dtos/update-book-dtos';
import { QueryBookDto } from './dtos/query-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectRepository(Book) private bookRepo: Repository<Book>) {}

  async createBook(bookDto: CreateBookDto, user: User) {
    const book = await this.bookRepo.create({ ...bookDto, addedBy: user });
    return await this.bookRepo.save(book);
  }

  async updateBook(id: number, dto: updateBookDto) {
    const book = await this.bookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);

    Object.assign(book, dto);

    return this.bookRepo.save(book);
  }

  async delete(id: number) {
    return this.bookRepo.delete(id);
  }

  async findAll(query: QueryBookDto) {
    const { search, page, limit } = query;

    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoin('book.addedBy', 'user')
      .addSelect(['user.id', 'user.name', 'user.email'])
      .orderBy('book.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (search) {
      qb.where('book.title LIKE :search OR book.author LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [item, total] = await qb.getManyAndCount();

    return { item, total, page, limit, totalpages: Math.ceil(total / limit) };
  }
}
