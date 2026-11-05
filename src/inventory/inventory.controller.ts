import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Role } from 'src/users/enums/Role.enum';
import { Roles } from 'src/users/decorators/role.decorator';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { AdjustThresholdDto } from './dto/adjust-thresold.dto';
import { GetHistoryDto } from './dto/get-history-dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('adjust-stock/:productId')
  adjustStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() adjustStockDto: AdjustStockDto,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.setStock(productId, adjustStockDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('adjust-threshold/:productId')
  adjustThreshold(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() adjustThresholdDto: AdjustThresholdDto,
  ) {
    return this.inventoryService.updateThreshold(
      productId,
      adjustThresholdDto.newThreshold,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('history')
  getAllHistory(@Query() dto: GetHistoryDto) {
    return this.inventoryService.getHistory(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('history/:productId')
  getProductHistory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() dto: GetHistoryDto,
  ) {
    return this.inventoryService.getHistory(dto, productId);
  }
}
