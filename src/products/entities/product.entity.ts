import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductTypeAssignment } from '../../product-types/entities/product-type-assigmnent.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';
import { Image } from './Image.entity';
import { Discount } from './discount.entity';
import { User } from 'src/users/entities/user.entity';
import { decimalTransformer } from '../helpers/product.helper';
import { InventoryLedger } from 'src/inventory/entities/InventoryLedger.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  vialSize?: string;

  @Column({ nullable: true })
  concentration?: string;

  @Column({ nullable: true, unique: true })
  sku?: string;

  @Column({ type: 'int', nullable: true })
  sortOrder!: number;

  @Column()
  isActive?: boolean;

  @Column()
  comingSoon?: boolean;

  @Column()
  inventoryEnabled!: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  basePrice!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  floorPrice!: number;
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  displayPrice!: number;
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  ceilingPrice!: number;
  @Column({
    type: 'int',
    default: 0,
  })
  currentStock!: number;
  @Column({
    type: 'int',
    nullable: true,
  })
  lowStockThreshold?: number | null;
  @OneToMany(() => ProductTypeAssignment, (assignment) => assignment.product)
  productTypeAssignment!: ProductTypeAssignment[];

  @OneToMany(() => CategoryAssignment, (assignment) => assignment.product)
  categoryAssigments!: CategoryAssignment[];

  @OneToMany(() => Image, (image) => image.product)
  images!: Image[];

  @OneToMany(() => Discount, (discount) => discount.product)
  discounts!: Discount[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
  @OneToMany(() => InventoryLedger, (Ledger) => Ledger.product)
  inventoryLedger!: InventoryLedger[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
