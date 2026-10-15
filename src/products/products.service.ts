import { map } from 'rxjs/operators';
import { Discount } from 'src/products/entities/discount.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateDiscountDto } from './dto/create.disocunt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { In, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { DataSource } from 'typeorm';
import { ProductTypeAssignment } from 'src/product-types/entities/product-type-assigmnent.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductType)
    private productTypeRepo: Repository<ProductType>,

    @InjectRepository(Category) private categoryRepo: Repository<Category>,

    @InjectRepository(Product) private ProductRepo: Repository<Product>,

    @InjectRepository(Discount) private DisocuntRepo: Repository<Discount>,

    private readonly dataSource: DataSource,
  ) {}
  private validateDiscount(discounts: CreateDiscountDto[] = []) {
    for (const [index, discount] of discounts.entries()) {
      if (discount.noUpperLimit) continue;

      if (
        discount.maximumDiscountQuantity! < discount.minimumDiscountQuantity
      ) {
        throw new BadRequestException(
          `Discount #${index + 1}: max quantity must be greater than or equal to min quantity`,
        );
      }
    }
  }
  private validateDiscountOverlap(discounts: CreateDiscountDto[] = []) {
    if (discounts.length < 2) return;

    const sortedArray = [...discounts].sort(
      (a, b) => a.minimumDiscountQuantity - b.minimumDiscountQuantity,
    );
    const describe = (d: CreateDiscountDto) =>
      d.noUpperLimit
        ? `${d.minimumDiscountQuantity}+ units`
        : `${d.minimumDiscountQuantity}-${d.maximumDiscountQuantity} units`;

    for (let i = 0; i < sortedArray.length - 1; i++) {
      const current = sortedArray[i];
      const next = sortedArray[i + 1];
      if (current.noUpperLimit) {
        throw new BadRequestException(
          `Discount tier "${describe(current)}" has no upper limit, so it already covers "${describe(next)}". ` +
            `Remove the later tier, or set a maximum quantity on the first one.`,
        );
      } else if (
        current.maximumDiscountQuantity! >= next.minimumDiscountQuantity
      ) {
        throw new BadRequestException(
          `Discount tiers "${describe(current)}" and "${describe(next)}" overlap. ` +
            `Each quantity can only match one tier, so the first tier must end before the next one starts.`,
        );
      }
    }
  }
  async create(createProductDto: CreateProductDto, user: User) {
    // Phase 1 : checks
    //TODO 1 check the pricing order rule

    const {
      basePrice,
      displayPrice,
      ceilingPrice,
      floorPrice,
      discounts,
      categoryIds,
      productTypeIds,
      ...productData
    } = createProductDto;

    if (basePrice > floorPrice) {
      throw new BadRequestException(
        'Base Price should be less or equal to the floor price',
      );
    }
    if (floorPrice > displayPrice) {
      throw new BadRequestException(
        'floor price should be less or equal to display price',
      );
    }

    if (displayPrice > ceilingPrice) {
      throw new BadRequestException(
        'display price should be less or equal to ceiling price  ',
      );
    }

    //TODO 2 discount min /max rule

    this.validateDiscount(discounts);
    this.validateDiscountOverlap(discounts);

    //TODO 3 categories and product type exist or not
    const categories = await this.categoryRepo.findBy({
      id: In(categoryIds),
    });

    if (categories.length !== new Set(categoryIds).size) {
      throw new BadRequestException('One or more category IDs are invalid');
    }
    const productTypes = await this.productTypeRepo.findBy({
      id: In(productTypeIds),
    });
    if (productTypes.length !== new Set(productTypeIds).size) {
      throw new BadRequestException('One or more product IDs are invalid');
    }

    //TODO 4 SKU already exist

    if (createProductDto.sku) {
      const exists = await this.ProductRepo.findOneBy({
        sku: createProductDto.sku,
      });
      if (exists) {
        throw new ConflictException('A product with this SKU already exists');
      }
    }

    // Phase 2 transcations (use only manager inside )
    // TODO 5 SAVE product
    // TODO 6 SAVE assigmnets
    // TODO 7 SAVE  discounts

    const productId = await this.dataSource.transaction(async (manager) => {
      const product = manager.create(Product, {
        ...productData,
        basePrice,
        displayPrice,
        ceilingPrice,
        floorPrice,
        createdBy: user,
      });
      await manager.save(product);

      const productTypeRow = productTypeIds.map((productTypeId) => ({
        productId: product.id,
        productTypeId: productTypeId,
      }));
      await manager.save(ProductTypeAssignment, productTypeRow);
      const categoryRow = categoryIds.map((categoryId) => ({
        productId: product.id,
        categoryId: categoryId,
      }));
      await manager.save(CategoryAssignment, categoryRow);

      const discountRow = (discounts ?? []).map((d) => ({
        ...d,
        productId: product.id,
        maximumDiscountQuantity: d.noUpperLimit
          ? null
          : d.maximumDiscountQuantity,
      }));
      await manager.save(Discount, discountRow);
      return product.id;
    });
    const createdProduct = await this.ProductRepo.findOne({
      where: { id: productId },
      relations: {
        images: true,
        assigments: true,
        typeAssignment: true,
        discounts: true,
        createdBy: true,
      },
    });

    //Phase 3
    // TODO 9 return product with the relation

    return createdProduct;
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
