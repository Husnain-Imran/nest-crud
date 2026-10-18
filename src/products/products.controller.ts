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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { Roles } from 'src/users/decorators/role.decorator';
import { Role } from 'src/users/enums/Role.enum';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_PER_PRODUCT,
} from './constants/image.constant';
import { uploadFiles } from 'uploadthing/client-future';
import { ParseDataFieldInterceptor } from './interceptor/parse-data-field.interceptor';

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

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
