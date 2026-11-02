import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApplyStockChangeType } from './types/InventoryTypes';
import { DataSource } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { StockChangeType, StockSource } from './enums/inventory.enum';
import { InventoryLedger } from './entities/InventoryLedger.entity';
import { User } from 'src/users/entities/user.entity';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}
  async applyStockChange(applyStockChangeInput: ApplyStockChangeType) {
    if (
      !Number.isInteger(applyStockChangeInput.quantity) ||
      applyStockChangeInput.quantity < 1
    ) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
    if (
      (applyStockChangeInput.source === StockSource.ADMIN_MANUAL ||
        applyStockChangeInput.source === StockSource.SYSTEM_CORRECTION ||
        applyStockChangeInput.source === StockSource.DAMAGE) &&
      !applyStockChangeInput.note?.trim()
    ) {
      throw new BadRequestException(
        'Note is required for this stock change type',
      );
    }
    if (
      (applyStockChangeInput.source === StockSource.ADMIN_MANUAL ||
        applyStockChangeInput.source === StockSource.DAMAGE) &&
      !applyStockChangeInput.performedBy
    ) {
      throw new BadRequestException(
        'Performed by is required for this stock change type',
      );
    }
    const product = await applyStockChangeInput.manager.findOne(Product, {
      where: { id: applyStockChangeInput.productId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!product.inventoryEnabled) {
      throw new BadRequestException(
        'Inventory is not enabled for this product',
      );
    }
    const newStock =
      applyStockChangeInput.changeType === StockChangeType.INCREASE
        ? product.currentStock + applyStockChangeInput.quantity
        : product.currentStock - applyStockChangeInput.quantity;
    if (newStock < 0) {
      throw new BadRequestException(
        `Cannot decrease stock below 0. Current stock: ${product.currentStock}, attempted decrease: ${applyStockChangeInput.quantity}`,
      );
    }
    const inventory = applyStockChangeInput.manager.create(InventoryLedger, {
      productId: applyStockChangeInput.productId,
      stockChangeType: applyStockChangeInput.changeType,
      quantity: applyStockChangeInput.quantity,
      resultingStock: newStock,
      source: applyStockChangeInput.source,
      performedBy: applyStockChangeInput.performedBy ?? null,
      note: applyStockChangeInput.note ?? null,
    });
    await applyStockChangeInput.manager.save(inventory);

    const updatedProduct = await applyStockChangeInput.manager.update(
      Product,
      applyStockChangeInput.productId,
      {
        currentStock: newStock,
      },
    );
    return { balance: newStock, ledger: inventory };
  }

  async setStock(productId: string, dto: AdjustStockDto, user: User) {
    await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      if (!product.inventoryEnabled) {
        throw new BadRequestException(
          'Inventory is not enabled for this product',
        );
      }
      const difference = dto.newStock - product.currentStock;
      if (difference === 0) {
        throw new BadRequestException('New stock is the same as current stock');
      }
      const changeType =
        difference > 0 ? StockChangeType.INCREASE : StockChangeType.DECREASE;
      if (
        (dto.source === StockSource.RETURN ||
          dto.source === StockSource.RESTOCK) &&
        changeType === StockChangeType.DECREASE
      ) {
        throw new BadRequestException(
          `Cannot decrease stock with source ${dto.source}. Only increase is allowed.`,
        );
      }
      if (
        dto.source === StockSource.DAMAGE &&
        changeType === StockChangeType.INCREASE
      ) {
        throw new BadRequestException(
          `Cannot increase stock with source ${dto.source}. Only decrease is allowed.`,
        );
      }

      await this.applyStockChange({
        manager,
        productId,
        changeType,
        quantity: Math.abs(difference),
        source: dto.source,
        performedBy: user,
        note: dto.note ?? null,
      });
    });
    return { message: 'Stock updated successfully' };
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
