-- AlterTable: replace shopName (varchar) + shopLegalCount (int) with JSON text lists
ALTER TABLE `EnvItem`
    DROP COLUMN `shopLegalCount`,
    DROP COLUMN `shopName`,
    ADD COLUMN `shopLegalNames` TEXT NULL,
    ADD COLUMN `shopNames`      TEXT NULL;
