import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { productTypeAssigment } from './product-type-assigmnent.entity';

@Entity()
export class productType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createAt!: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => productTypeAssigment, (assignment) => assignment.productType)
  productAssigment!: productTypeAssigment;
}
