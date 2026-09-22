-- AlterTable
ALTER TABLE `Village` ADD COLUMN `isKpiVillage` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isQualityVillage` BOOLEAN NOT NULL DEFAULT false;
