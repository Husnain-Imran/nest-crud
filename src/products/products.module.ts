import { Entity } from 'typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { category } from './entities/category.entity';
import { productType } from './entities/product-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, category, productType])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
