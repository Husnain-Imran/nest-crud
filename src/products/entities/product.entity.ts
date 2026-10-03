import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductTypeAssignment } from '../../product-types/entities/product-type-assigmnent.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';

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

  @Column({ nullable: true })
  sortOrder?: number;

  @Column()
  isActive?: boolean;

  @Column()
  commingSoon?: boolean;

  @Column()
  inventoryEnabled!: boolean;

  @Column()
  basePrice!: number;

  @Column()
  floorPrice!: number;
  @Column()
  displayPrice!: number;
  @Column()
  ceilingPrice!: number;

  @OneToMany(() => ProductTypeAssignment, (assignment) => assignment.product)
  typeAssignment!: ProductTypeAssignment[];

  @OneToMany(() => CategoryAssignment, (assignment) => assignment.product)
  assigments!: CategoryAssignment[];
}
