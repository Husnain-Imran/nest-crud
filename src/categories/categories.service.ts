import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchCategoryDto } from './dto/search-category.dto';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepo.create(createCategoryDto);
    await this.categoryRepo.save(category);
    return category;
  }

  async findAll(searchCategoryDto: SearchCategoryDto) {
    const { search, page, limit } = searchCategoryDto;

    const [items, total] = await this.categoryRepo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPage: Math.ceil(total / limit) };
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!category) return 'Category not found';

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!category) return 'Category not found';
    return await this.categoryRepo.remove(category);
  }
}
