import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
