import { productType } from './entities/product-type.entity';
import { Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { searchProductTypeDto } from './dto/search-product-type.dto';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(productType)
    private productTypeRepo: Repository<productType>,
  ) {}

  async create(createProductTypeDto: CreateProductTypeDto) {
    const productType = this.productTypeRepo.create(createProductTypeDto);
    await this.productTypeRepo.save(productType);

    return {
      message: 'Product type created successfully',
    };
  }

  async findAll(searchProductType: searchProductTypeDto) {
    const { search, page, limit } = searchProductType;

    const [items, total] = await this.productTypeRepo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { createAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} productType`;
  }

  async update(id: string, updateProductTypeDto: UpdateProductTypeDto) {
    const productType = await this.productTypeRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!productType) return 'Product type not found';

    Object.assign(productType, updateProductTypeDto);

    return await this.productTypeRepo.save(productType);
  }

  async remove(id: string) {
    const result = await this.productTypeRepo.delete(id);
    if (result.affected === 0) {
      return 'Product does not exist';
    }
    return 'Product deleted successfully';
  }
}
