import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { productType } from './entities/product-type.entity';
import { productTypeAssigment } from './entities/product-type-assigmnent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([productType, productTypeAssigment])],
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
})
export class ProductTypesModule {}
