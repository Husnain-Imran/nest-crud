import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryAssignment } from './entities/category-assigment.entity';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryAssignment])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
