import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockSource, StockChangeType } from '../enums/inventory.enum';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { decimalTransformer } from 'src/products/helpers/product.helper';

@Index(['productId', 'createdAt'])
@Entity()
export class InventoryLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ type: 'enum', enum: StockChangeType, name: 'stock_change_type' })
  stockChangeType!: StockChangeType;
  @Column({ type: 'int' })
  quantity!: number;
  @Column({ type: 'int', name: 'resulting_stock' })
  resultingStock!: number;
  @Column({ type: 'enum', enum: StockSource, name: 'source' })
  source!: StockSource;
  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string | null;
  //   @Column({
  //     type: 'decimal',
  //     precision: 10,
  //     scale: 2,
  //     transformer: decimalTransformer,
  //     name: 'unit_cost',
  //     nullable: true,
  //   })
  //   unitCost?: number | null; will add it for when we order a product and for that we hold the amount
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'performed_by' })
  performedBy!: User | null;

  @Column({ name: 'product_id' }) // this must exist for the index to work
  productId!: string;
  @ManyToOne(() => Product, (product) => product.inventoryLedger, {
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
