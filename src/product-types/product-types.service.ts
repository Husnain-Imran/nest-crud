import { ProductType } from './entities/product-type.entity';
import { Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { searchProductTypeDto } from './dto/search-product-type.dto';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType)
    private ProductTypeRepo: Repository<ProductType>,
  ) {}

  async create(createProductTypeDto: CreateProductTypeDto) {
    const ProductType = this.ProductTypeRepo.create(createProductTypeDto);
    await this.ProductTypeRepo.save(ProductType);

    return {
      message: 'Product type created successfully',
    };
  }

  async findAll(searchProductType: searchProductTypeDto) {
    const { search, page, limit } = searchProductType;

    const [items, total] = await this.ProductTypeRepo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { createdAt: 'DESC' },
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
    return `This action returns a #${id} ProductType`;
  }

  async update(id: string, updateProductTypeDto: UpdateProductTypeDto) {
    const ProductType = await this.ProductTypeRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!ProductType) return 'Product type not found';

    Object.assign(ProductType, updateProductTypeDto);

    return await this.ProductTypeRepo.save(ProductType);
  }

  async remove(id: string) {
    const result = await this.ProductTypeRepo.delete(id);
    if (result.affected === 0) {
      return 'Product does not exist';
    }
    return 'Product deleted successfully';
  }
}
