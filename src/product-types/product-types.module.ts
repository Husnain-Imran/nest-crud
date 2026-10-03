import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductTypeAssignment } from './entities/product-type-assigmnent.entity';
import { ProductType } from './entities/product-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType, ProductTypeAssignment])],
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
})
export class ProductTypesModule {}
