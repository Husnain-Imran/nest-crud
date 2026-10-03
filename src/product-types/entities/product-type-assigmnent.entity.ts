import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductType } from './product-type.entity';

@Entity()
export class ProductTypeAssignment {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @PrimaryColumn({ name: 'product_type_id', type: 'uuid' })
  productTypeId!: string;
  @ManyToOne(() => Product, (product) => product.typeAssignment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductType, (productType) => productType.productAssigment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_type_id' })
  productType!: ProductType;
}
