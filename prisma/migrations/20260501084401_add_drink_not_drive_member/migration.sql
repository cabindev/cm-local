-- CreateTable
CREATE TABLE `DrinkNotDriveMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL,
    `year1Result` TEXT NULL,
    `year2Result` TEXT NULL,
    `year3Result` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DrinkNotDriveMember_villageId_idx`(`villageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DrinkNotDriveMember` ADD CONSTRAINT `DrinkNotDriveMember_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
