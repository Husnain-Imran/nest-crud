import { Entity } from 'typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ProductTypeAssignment } from 'src/product-types/entities/product-type-assigmnent.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';
import { Discount } from './entities/discount.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Product ,  ProductType , ProductTypeAssignment  , Category , CategoryAssignment , Discount])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
