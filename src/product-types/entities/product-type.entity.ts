import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { productTypeAssigment } from './product-type-assigmnent.entity';

@Entity()
export class productType {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ name: 'created_at' })
  createAt!: Date;

  @Column({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => productTypeAssigment, (assignment) => assignment.productType)
  productAssigment!: productTypeAssigment;
}
