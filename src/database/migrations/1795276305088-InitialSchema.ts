import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795276305088 implements MigrationInterface {
    name = 'InitialSchema1795276305088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_type\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8978484a9cee7a0c780cd259b8\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_type_assignment\` (\`product_id\` varchar(255) NOT NULL, \`product_type_id\` varchar(255) NOT NULL, PRIMARY KEY (\`product_id\`, \`product_type_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_assignment\` (\`category_id\` varchar(255) NOT NULL, \`product_id\` varchar(255) NOT NULL, PRIMARY KEY (\`category_id\`, \`product_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`image\` (\`id\` varchar(36) NOT NULL, \`url\` varchar(255) NOT NULL, \`fileKey\` varchar(255) NOT NULL, \`isThumbnail\` tinyint NOT NULL DEFAULT 0, \`displayOrder\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`product_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`discount\` (\`id\` varchar(36) NOT NULL, \`discountType\` enum ('percentage', 'fixed') NOT NULL, \`minimumDiscountQuantity\` int NOT NULL DEFAULT '1', \`maximumDiscountQuantity\` int NULL, \`noUpperLimit\` tinyint NOT NULL DEFAULT 0, \`discountAmount\` decimal(10,2) NOT NULL, \`product_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`inventory_ledger\` (\`id\` varchar(36) NOT NULL, \`stock_change_type\` enum ('increase', 'decrease') NOT NULL, \`quantity\` int NOT NULL, \`resulting_stock\` int NOT NULL, \`source\` enum ('admin_manual', 'sale', 'system_correction', 'damage', 'return', 'restock') NOT NULL, \`note\` text NULL, \`product_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`performed_by\` int NULL, INDEX \`IDX_7355df98836c7c43d315added4\` (\`product_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`vialSize\` varchar(255) NULL, \`concentration\` varchar(255) NULL, \`sku\` varchar(255) NULL, \`sortOrder\` int NULL, \`isActive\` tinyint NOT NULL, \`comingSoon\` tinyint NOT NULL, \`inventoryEnabled\` tinyint NOT NULL, \`basePrice\` decimal(10,2) NOT NULL, \`floorPrice\` decimal(10,2) NOT NULL, \`displayPrice\` decimal(10,2) NOT NULL, \`ceilingPrice\` decimal(10,2) NOT NULL, \`currentStock\` int NOT NULL DEFAULT '0', \`lowStockThreshold\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`created_by\` int NULL, UNIQUE INDEX \`IDX_34f6ca1cd897cc926bdcca1ca3\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`author\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`addedById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_type_assignment\` ADD CONSTRAINT \`FK_3b97aaed2fdea1f05b0ab6c56e1\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_type_assignment\` ADD CONSTRAINT \`FK_4a7919b29b19a9073df324b98d2\` FOREIGN KEY (\`product_type_id\`) REFERENCES \`product_type\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_assignment\` ADD CONSTRAINT \`FK_6a477d022fd5ccfa360ea4c0a42\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_assignment\` ADD CONSTRAINT \`FK_7e717231141809b434b3e2d4b9f\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_e6a9e829e17fc47fc17d695af8e\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`discount\` ADD CONSTRAINT \`FK_070fc062930e8f995a39bd70f8b\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`inventory_ledger\` ADD CONSTRAINT \`FK_256512206717a9eaabace26c362\` FOREIGN KEY (\`performed_by\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`inventory_ledger\` ADD CONSTRAINT \`FK_6bfc43bdb3bd3dd0b3c1920acc7\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_b5effca691499d21c5ec683ced6\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book\` ADD CONSTRAINT \`FK_64b1e69016cecd7eebd00bdbeb4\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_64b1e69016cecd7eebd00bdbeb4\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_b5effca691499d21c5ec683ced6\``);
        await queryRunner.query(`ALTER TABLE \`inventory_ledger\` DROP FOREIGN KEY \`FK_6bfc43bdb3bd3dd0b3c1920acc7\``);
        await queryRunner.query(`ALTER TABLE \`inventory_ledger\` DROP FOREIGN KEY \`FK_256512206717a9eaabace26c362\``);
        await queryRunner.query(`ALTER TABLE \`discount\` DROP FOREIGN KEY \`FK_070fc062930e8f995a39bd70f8b\``);
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_e6a9e829e17fc47fc17d695af8e\``);
        await queryRunner.query(`ALTER TABLE \`category_assignment\` DROP FOREIGN KEY \`FK_7e717231141809b434b3e2d4b9f\``);
        await queryRunner.query(`ALTER TABLE \`category_assignment\` DROP FOREIGN KEY \`FK_6a477d022fd5ccfa360ea4c0a42\``);
        await queryRunner.query(`ALTER TABLE \`product_type_assignment\` DROP FOREIGN KEY \`FK_4a7919b29b19a9073df324b98d2\``);
        await queryRunner.query(`ALTER TABLE \`product_type_assignment\` DROP FOREIGN KEY \`FK_3b97aaed2fdea1f05b0ab6c56e1\``);
        await queryRunner.query(`DROP TABLE \`book\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_34f6ca1cd897cc926bdcca1ca3\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP INDEX \`IDX_7355df98836c7c43d315added4\` ON \`inventory_ledger\``);
        await queryRunner.query(`DROP TABLE \`inventory_ledger\``);
        await queryRunner.query(`DROP TABLE \`discount\``);
        await queryRunner.query(`DROP TABLE \`image\``);
        await queryRunner.query(`DROP TABLE \`category_assignment\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`product_type_assignment\``);
        await queryRunner.query(`DROP INDEX \`IDX_8978484a9cee7a0c780cd259b8\` ON \`product_type\``);
        await queryRunner.query(`DROP TABLE \`product_type\``);
    }

}
