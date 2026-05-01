/*
  Warnings:

  - You are about to drop the `CommunityParticipation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Environment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CommunityParticipation` DROP FOREIGN KEY `CommunityParticipation_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `Environment` DROP FOREIGN KEY `Environment_villageId_fkey`;

-- DropTable
DROP TABLE `CommunityParticipation`;

-- DropTable
DROP TABLE `Environment`;

-- CreateTable
CREATE TABLE `CommunityStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `meetingCount` INTEGER NOT NULL DEFAULT 0,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `fundAmount` DOUBLE NOT NULL DEFAULT 0,
    `activityCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `CommunityStats_villageId_idx`(`villageId`),
    UNIQUE INDEX `CommunityStats_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnvItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `hasItem` BOOLEAN NOT NULL DEFAULT false,
    `itemCount` INTEGER NOT NULL DEFAULT 0,
    `result1` TEXT NULL,
    `result2` TEXT NULL,
    `result3` TEXT NULL,

    INDEX `EnvItem_villageId_idx`(`villageId`),
    UNIQUE INDEX `EnvItem_villageId_itemType_key`(`villageId`, `itemType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunityOrg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `orgType` VARCHAR(191) NOT NULL,
    `hasParticipation` BOOLEAN NOT NULL DEFAULT false,
    `result1` TEXT NULL,
    `result2` TEXT NULL,
    `result3` TEXT NULL,

    INDEX `CommunityOrg_villageId_idx`(`villageId`),
    UNIQUE INDEX `CommunityOrg_villageId_orgType_key`(`villageId`, `orgType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CommunityStats` ADD CONSTRAINT `CommunityStats_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnvItem` ADD CONSTRAINT `EnvItem_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityOrg` ADD CONSTRAINT `CommunityOrg_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
