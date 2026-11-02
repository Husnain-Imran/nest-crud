import { EntityManager } from 'typeorm';

import { StockChangeType, StockSource } from '../enums/inventory.enum';
import { User } from 'src/users/entities/user.entity';
export type ApplyStockChangeType = {
  manager: EntityManager;
  productId: string;
  changeType: StockChangeType;
  quantity: number;
  source: StockSource;
  performedBy?: User | null;
  note?: string | null;
};
