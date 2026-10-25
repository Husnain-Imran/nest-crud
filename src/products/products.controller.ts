import { CurrentUser } from './../users/decorators/current-user.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { Roles } from 'src/users/decorators/role.decorator';
import { Role } from 'src/users/enums/Role.enum';
import { User } from 'src/users/entities/user.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_PER_PRODUCT,
} from './constants/image.constant';
import { uploadFiles } from 'uploadthing/client-future';
import { ParseDataFieldInterceptor } from './interceptor/parse-data-field.interceptor';
import { SearchProductDto } from './dto/search-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGE_PER_PRODUCT, {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
      fileFilter: (req, file, callBack) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          return callBack(
            new BadRequestException(
              'Only jpeg, png and webp images are allowed',
            ),
            false,
          );
        }
        callBack(null, true);
      },
    }),
    ParseDataFieldInterceptor,
  )
  @Roles(Role.Admin)
  @Post()
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    console.log('files', files);
    return this.productsService.create(createProductDto, user, files);
  }
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get()
  findAll(@Query() productDto: SearchProductDto) {
    return this.productsService.findAll(productDto);
  }
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGE_PER_PRODUCT, {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
      fileFilter: (req, file, callBack) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          return callBack(
            new BadRequestException(
              'Only jpeg, png and webp images are allowed',
            ),
            false,
          );
        }
        callBack(null, true);
      },
    }),
    ParseDataFieldInterceptor,
  )
  @Roles(Role.Admin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
