import { Exclude } from 'class-transformer';

import { Book } from 'src/books/entity/book.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  role!: string;

  @OneToMany(() => Book, (book) => book.addedBy)
  books!: Book[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
  @OneToMany(() => Product, (Product) => Product.createdBy)
  products!: Product[];
}
