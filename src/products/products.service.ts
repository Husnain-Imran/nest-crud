import { UploadResult, UploadSuccess } from './../uploadthing/types/types';
import { UploadthingService } from './../uploadthing/uploadthing.service';
import { Discount } from 'src/products/entities/discount.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateDiscountDto } from './dto/create.disocunt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Between, In, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { DataSource } from 'typeorm';
import { ProductTypeAssignment } from 'src/product-types/entities/product-type-assigmnent.entity';
import { CategoryAssignment } from 'src/categories/entities/category-assigment.entity';
import { Image } from './entities/Image.entity';
import { MAX_IMAGE_PER_PRODUCT } from './constants/image.constant';

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
  private validatePricing(prices: {
    basePrice: number;
    floorPrice: number;
    displayPrice: number;
    ceilingPrice: number;
  }) {
    const { basePrice, floorPrice, displayPrice, ceilingPrice } = prices;
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

    this.validatePricing({
      basePrice,
      floorPrice,
      displayPrice,
      ceilingPrice,
    });

    this.validateDiscount(discounts);
    this.validateDiscountOverlap(discounts);
    let uploaded: UploadSuccess[] = [];

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
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    console.log('the data from update dto', updateProductDto);
    const existingProduct = await this.ProductRepo.findOne({
      where: { id: id },
      relations: {
        images: true,
      },
    });
    if (!existingProduct) {
      throw new NotFoundException('Product Not Found ');
    }
    const { deletedImageKeys, ...feilds } = updateProductDto;

    // 2. Validate null and empty string values
    const invalidFields = Object.entries(feilds)
      .filter(([_, value]) => value === null || value === '')
      .map(([key]) => key);
    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `The following fields cannot be null or empty: ${invalidFields.join(', ')}`,
      );
    }

    const hasDeletedFiles = !!deletedImageKeys?.length;
    const hasNewFiles = files.length > 0;
    console.log('fields', feilds);
    const hasUpdateFields = Object.values(feilds).some(
      (value) => value !== undefined && value !== null,
    );

    if (!hasDeletedFiles && !hasNewFiles && !hasUpdateFields) {
      throw new BadRequestException(
        'No changes provided: send at least one field, deletedImageIds, or image file.',
      );
    }
    const { basePrice, floorPrice, displayPrice, ceilingPrice } = feilds;
    const hasPriceUpdate = [
      basePrice,
      floorPrice,
      displayPrice,
      ceilingPrice,
    ].some((price) => price !== undefined);
    if (hasPriceUpdate) {
      this.validatePricing({
        basePrice: basePrice ?? existingProduct.basePrice,
        floorPrice: floorPrice ?? existingProduct.floorPrice,
        displayPrice: displayPrice ?? existingProduct.displayPrice,
        ceilingPrice: ceilingPrice ?? existingProduct.ceilingPrice,
      });
    }

    const { categoryIds, productTypeIds, discounts, sortOrder, ...columns } =
      feilds;

    if (categoryIds !== undefined) {
      const existingCategories = await this.categoryRepo.findBy({
        id: In(categoryIds),
      });
      if (existingCategories.length !== new Set(categoryIds).size) {
        throw new BadRequestException(
          'One or more provided categories are invalid',
        );
      }
    }
    if (productTypeIds !== undefined) {
      const existingProductTypeIds = await this.productTypeRepo.findBy({
        id: In(productTypeIds),
      });
      if (existingProductTypeIds.length !== new Set(productTypeIds).size) {
        throw new BadRequestException(
          'One or more provided product types id  are invalid',
        );
      }
    }

    if (columns.sku && columns.sku !== existingProduct.sku) {
      const skuTaken = await this.ProductRepo.findOneBy({
        sku: columns.sku,
        id: Not(id),
      });
      if (skuTaken) {
        throw new ConflictException('A product with this SKU already exists');
      }
    }
    if (discounts !== undefined) {
      this.validateDiscount(discounts);
      this.validateDiscountOverlap(discounts);
    }

    const updates = Object.fromEntries(
      Object.entries(columns).filter(([_, value]) => value !== undefined),
    );
    const hasSortOrder = sortOrder !== undefined;

    let imageToDelete: Image[] = [];
    if (deletedImageKeys !== undefined) {
      const existingImageKeySet = new Set(
        existingProduct.images.map((image) => image.fileKey),
      );

      const isImageKeyValid = (deletedImageKeys ?? []).every((key) =>
        existingImageKeySet.has(key),
      );
      if (!isImageKeyValid) {
        throw new BadRequestException('One or two image key is invalid');
      }
      imageToDelete = existingProduct.images.filter((image) =>
        deletedImageKeys.includes(image.fileKey),
      );
    }
    const maxCountCheck =
      existingProduct.images.length - imageToDelete.length + files.length;
    if (maxCountCheck > MAX_IMAGE_PER_PRODUCT) {
      throw new BadRequestException(
        `Number of uplaoded images increase by ${MAX_IMAGE_PER_PRODUCT}`,
      );
    }
    let uploaded: UploadSuccess[] = [];
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
    try {
      const productId = await this.dataSource.transaction(async (manager) => {
        if (hasSortOrder) {
          const max = (await manager.maximum(Product, 'sortOrder')) ?? 0;
          const existingSortOrder = existingProduct.sortOrder;

          // 1. the ceiling: max if the product already has a position, max + 1 if it doesn't
          const ceiling = existingSortOrder == null ? max + 1 : max;

          // 2. clamp the REQUESTED number between 1 and the ceiling
          const newPosition = Math.min(Math.max(sortOrder, 1), ceiling);
          if (newPosition !== existingProduct.sortOrder) {
            if (existingProduct.sortOrder == null) {
              await manager.increment(
                Product, // 1. which table
                {
                  sortOrder: MoreThanOrEqual(newPosition),
                }, // 2. which rows (the WHERE)
                'sortOrder', // 3. which column to change
                1, // 4. how much to add
              );
            } else if (newPosition < existingProduct.sortOrder) {
              await manager.increment(
                Product, // 1. which table
                {
                  sortOrder: Between(
                    newPosition,
                    existingProduct.sortOrder - 1,
                  ),
                }, // 2. which rows (the WHERE)
                'sortOrder', // 3. which column to change
                1, // 4. how much to add
              );
            } else {
              await manager.decrement(
                Product, // 1. which table
                {
                  sortOrder: Between(
                    existingProduct.sortOrder + 1,
                    newPosition,
                  ),
                }, // 2. which rows (the WHERE)
                'sortOrder', // 3. which column to change
                1, // 4. how much to add
              );
            }
            updates.sortOrder = newPosition;
          }
        }
        if (Object.keys(updates).length > 0) {
          const product = await manager.update(
            Product,
            existingProduct.id,
            updates,
            // sort order logic will be later
          );
        }

        if (categoryIds !== undefined) {
          await manager.delete(CategoryAssignment, {
            productId: existingProduct.id,
          });
          await manager.save(
            CategoryAssignment,
            categoryIds.map((categoryId) => ({
              productId: existingProduct.id,
              categoryId,
            })),
          );
        }
        if (productTypeIds !== undefined) {
          await manager.delete(ProductTypeAssignment, {
            productId: existingProduct.id,
          });
          await manager.save(
            ProductTypeAssignment,
            productTypeIds.map((productTypeId) => ({
              productId: existingProduct.id,
              productTypeId,
            })),
          );
        }
        if (discounts !== undefined) {
          await manager.delete(Discount, {
            productId: existingProduct.id,
          });

          const discountRow = discounts.map((d) => ({
            ...d,
            maximumDiscountQuantity: d.noUpperLimit
              ? null
              : d.maximumDiscountQuantity,
            productId: existingProduct.id,
          }));
          await manager.save(Discount, discountRow);
        }
        if (deletedImageKeys !== undefined) {
          await manager.delete(Image, {
            fileKey: In(deletedImageKeys),
            productId: existingProduct.id,
          });
        }
        const remainingImages = await manager.find(Image, {
          where: {
            productId: existingProduct.id,
          },
        });
        const startingPoint =
          remainingImages.length > 0
            ? Math.max(...remainingImages.map((image) => image.displayOrder)) +
              1
            : 0;

        const hasThumbnail = remainingImages.some((image) => image.isThumbnail);
        const newRows = uploaded.map((file, index) => ({
          productId: existingProduct.id,
          url: file.url,
          fileKey: file.key,
          displayOrder: startingPoint + index,
          isThumbnail: false,
        }));
        if (!hasThumbnail) {
          if (remainingImages.length > 0) {
            const first = [...remainingImages].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            )[0];
            await manager.update(Image, first.id, { isThumbnail: true });
          } else if (newRows.length > 0) {
            newRows[0].isThumbnail = true;
          }
        }
        if (newRows.length > 0) {
          await manager.save(Image, newRows);
        }
      });
    } catch (err: any) {
      // the new files are in UploadThing, but the rows were rolled back
      await this.safeDelete(uploaded.map((file) => file.key));

      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A product with this SKU already exists');
      }
      throw err;
    }
    // only reached when the transaction committed
    await this.safeDelete(imageToDelete.map((image) => image.fileKey));

    return this.ProductRepo.findOne({
      where: { id },
      relations: {
        images: true,
        assigments: true,
        typeAssignment: true,
        discounts: true,
      },
      order: {
        images: { displayOrder: 'ASC', createdAt: 'ASC' },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
