-- AlterTable
ALTER TABLE `EnvItem` DROP COLUMN `itemCount`,
    ADD COLUMN `hasCommunityRule` BOOLEAN NULL,
    ADD COLUMN `hasPolicy` BOOLEAN NULL,
    ADD COLUMN `noAlcohol` BOOLEAN NULL,
    ADD COLUMN `shopLegalCount` INTEGER NULL,
    ADD COLUMN `shopName` VARCHAR(191) NULL;
