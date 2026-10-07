import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'boolean' })
  discountType!: boolean;

  @Column()
  minimumDiscountQuantity!: number;

  @Column()
  maximumDiscountQuantity!: number;

  @Column()
  noUpperLimit!: boolean;

  @Column()
  discountAmount!: number;

  @Column({ type: 'float' })
  discountPercentage!: number;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.discounts)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
