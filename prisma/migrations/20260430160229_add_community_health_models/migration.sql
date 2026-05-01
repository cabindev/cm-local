-- CreateTable
CREATE TABLE `Village` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageName` VARCHAR(191) NOT NULL,
    `villageNo` VARCHAR(191) NOT NULL,
    `tambon` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NOT NULL,
    `coordinator` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Village_province_idx`(`province`),
    INDEX `Village_amphoe_idx`(`amphoe`),
    INDEX `Village_tambon_idx`(`tambon`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScreeningResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `totalPopulation` INTEGER NOT NULL DEFAULT 0,
    `screenedCount` INTEGER NOT NULL DEFAULT 0,
    `alcoholRiskHigh` INTEGER NOT NULL DEFAULT 0,
    `alcoholRiskLow` INTEGER NOT NULL DEFAULT 0,
    `tobaccoCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `ScreeningResult_villageId_idx`(`villageId`),
    UNIQUE INDEX `ScreeningResult_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlcoholParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `targetCount` INTEGER NOT NULL DEFAULT 0,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `quitCount` INTEGER NOT NULL DEFAULT 0,
    `reducedCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `AlcoholParticipant_villageId_idx`(`villageId`),
    UNIQUE INDEX `AlcoholParticipant_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlcoholResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `month3Quit` INTEGER NOT NULL DEFAULT 0,
    `month3Reduced` INTEGER NOT NULL DEFAULT 0,
    `month6Quit` INTEGER NOT NULL DEFAULT 0,
    `month6Reduced` INTEGER NOT NULL DEFAULT 0,

    INDEX `AlcoholResult_villageId_idx`(`villageId`),
    UNIQUE INDEX `AlcoholResult_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TobaccoParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `targetCount` INTEGER NOT NULL DEFAULT 0,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `quitCount` INTEGER NOT NULL DEFAULT 0,
    `reducedCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `TobaccoParticipant_villageId_idx`(`villageId`),
    UNIQUE INDEX `TobaccoParticipant_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TobaccoResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `month3Quit` INTEGER NOT NULL DEFAULT 0,
    `month3Reduced` INTEGER NOT NULL DEFAULT 0,
    `month6Quit` INTEGER NOT NULL DEFAULT 0,
    `month6Reduced` INTEGER NOT NULL DEFAULT 0,

    INDEX `TobaccoResult_villageId_idx`(`villageId`),
    UNIQUE INDEX `TobaccoResult_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrinkNotDrive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `pledgeCount` INTEGER NOT NULL DEFAULT 0,
    `checkpointCount` INTEGER NOT NULL DEFAULT 0,
    `violationCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `DrinkNotDrive_villageId_idx`(`villageId`),
    UNIQUE INDEX `DrinkNotDrive_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Environment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `banAdvertisingCount` INTEGER NOT NULL DEFAULT 0,
    `banSaleCount` INTEGER NOT NULL DEFAULT 0,
    `policyCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `Environment_villageId_idx`(`villageId`),
    UNIQUE INDEX `Environment_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunityParticipation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `meetingCount` INTEGER NOT NULL DEFAULT 0,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `fundAmount` DOUBLE NOT NULL DEFAULT 0,
    `activityCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `CommunityParticipation_villageId_idx`(`villageId`),
    UNIQUE INDEX `CommunityParticipation_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScreeningResult` ADD CONSTRAINT `ScreeningResult_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlcoholParticipant` ADD CONSTRAINT `AlcoholParticipant_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlcoholResult` ADD CONSTRAINT `AlcoholResult_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TobaccoParticipant` ADD CONSTRAINT `TobaccoParticipant_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TobaccoResult` ADD CONSTRAINT `TobaccoResult_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DrinkNotDrive` ADD CONSTRAINT `DrinkNotDrive_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Environment` ADD CONSTRAINT `Environment_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityParticipation` ADD CONSTRAINT `CommunityParticipation_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
