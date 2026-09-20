import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book-dtos';

export class updateBookDto extends PartialType(CreateBookDto) {}
