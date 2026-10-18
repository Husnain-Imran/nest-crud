import { UploadResult, UploadSuccess } from './../uploadthing/types/types';
import { UploadthingService } from './../uploadthing/uploadthing.service';
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
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { DataSource } from 'typeorm';
import { ProductTypeAssignment } from 'src/product-types/entities/product-type-assigmnent.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';
import { uploadFile } from 'uploadthing/client-future';
import { Image } from './entities/Image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductType)
    private productTypeRepo: Repository<ProductType>,

    @InjectRepository(Category) private categoryRepo: Repository<Category>,

    @InjectRepository(Product) private ProductRepo: Repository<Product>,

    @InjectRepository(Discount) private DisocuntRepo: Repository<Discount>,

    private readonly UploadthingService: UploadthingService,

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
  private async safeDelete(keys: string[]) {
    if (keys.length === 0) return;
    try {
      await this.UploadthingService.deleteFile(keys);
    } catch (e) {
      // don't let cleanup failure hide the real error; log it so you can clean up later
      console.error('UploadThing cleanup failed', keys, e);
    }
  }
  async create(
    createProductDto: CreateProductDto,
    user: User,
    files: Express.Multer.File[] = [],
  ) {
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
      sortOrder,
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
    let uploaded: UploadSuccess[] = [];

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

    if (files.length > 0) {
      const result = await this.UploadthingService.uploadFiles(files);
      const succeeded = result.filter((r): r is UploadSuccess => 'key' in r);
      const failed = result.filter((r) => 'error' in r);
      if (failed.length > 0) {
        await this.safeDelete(succeeded.map((r) => r.key));
        throw new BadRequestException({
          message: 'Failed to upload one or more product images.',
          errors: failed.map((r) =>
            'error' in r ? `Image #${r.index + 1}: ${r.error}` : '',
          ),
        });
      }
      uploaded = succeeded.sort((a, b) => a.index - b.index);
    }

    // Phase 2 transcations (use only manager inside )
    // TODO 5 SAVE product
    // TODO 6 SAVE assigmnets
    // TODO 7 SAVE  discou

    try {
      const productId = await this.dataSource.transaction(async (manager) => {
        // position logic

        const max = (await manager.maximum(Product, 'sortOrder')) ?? 0;
        const end = max + 1;
        const position = Math.min(Math.max(sortOrder ?? end, 1), end);

        await manager.increment(
          Product, // 1. which table
          { sortOrder: MoreThanOrEqual(position) }, // 2. which rows (the WHERE)
          'sortOrder', // 3. which column to change
          1, // 4. how much to add
        );
        const product = manager.create(Product, {
          ...productData,
          basePrice,
          displayPrice,
          ceilingPrice,
          floorPrice,
          sortOrder: position,
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

        if (uploaded.length > 0) {
          await manager.save(
            Image,
            uploaded.map((image) =>
              manager.create(Image, {
                productId: product.id,
                url: image.url,
                fileKey: image.key,
                displayOrder: image.index,
                isThumbnail: image.index === 0,
              }),
            ),
          );
        }
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
      return createdProduct;
    } catch (err) {
      this.safeDelete(uploaded.map((r) => r.key));

      return err;
    }

    //Phase 3
    // TODO 9 return product with the relation
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
