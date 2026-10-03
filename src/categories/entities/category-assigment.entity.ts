import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class CategoryAssignment {
  // Define properties and relationships for the CategoryAssigment entity here
  @PrimaryColumn({ name: 'category_id', type: 'uuid' })
  categoryId!: string;
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Category, (category) => category.assigments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => Product, (product) => product.assigments)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
