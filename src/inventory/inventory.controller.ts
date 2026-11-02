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
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from 'src/auth/guard/JwtAuthGuard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Role } from 'src/users/enums/Role.enum';
import { Roles } from 'src/users/decorators/role.decorator';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
