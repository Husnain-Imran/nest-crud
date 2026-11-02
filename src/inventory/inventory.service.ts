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
