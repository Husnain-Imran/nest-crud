import { decimalTransformer } from './../helpers/product.helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { DiscountType } from '../enums/product.enum';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: DiscountType })
  discountType!: DiscountType;

  @Column({ type: 'int', default: 1 })
  minimumDiscountQuantity!: number;

  @Column({ type: 'int', default: null })
  maximumDiscountQuantity!: number | null;

  @Column({ type: 'boolean', default: false })
  noUpperLimit!: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  discountAmount!: number;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.discounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt?: Date;
}
