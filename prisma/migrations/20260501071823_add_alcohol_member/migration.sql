-- CreateTable
CREATE TABLE `AlcoholMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL,
    `y1Money` BOOLEAN NOT NULL DEFAULT false,
    `y1Property` BOOLEAN NOT NULL DEFAULT false,
    `y1Family` BOOLEAN NOT NULL DEFAULT false,
    `y1Health` BOOLEAN NOT NULL DEFAULT false,
    `y1Work` BOOLEAN NOT NULL DEFAULT false,
    `y1Accepted` BOOLEAN NOT NULL DEFAULT false,
    `y1Other` BOOLEAN NOT NULL DEFAULT false,
    `y1OtherText` TEXT NULL,
    `y2Money` BOOLEAN NOT NULL DEFAULT false,
    `y2Property` BOOLEAN NOT NULL DEFAULT false,
    `y2Family` BOOLEAN NOT NULL DEFAULT false,
    `y2Health` BOOLEAN NOT NULL DEFAULT false,
    `y2Work` BOOLEAN NOT NULL DEFAULT false,
    `y2Accepted` BOOLEAN NOT NULL DEFAULT false,
    `y2Other` BOOLEAN NOT NULL DEFAULT false,
    `y2OtherText` TEXT NULL,
    `y3Money` BOOLEAN NOT NULL DEFAULT false,
    `y3Property` BOOLEAN NOT NULL DEFAULT false,
    `y3Family` BOOLEAN NOT NULL DEFAULT false,
    `y3Health` BOOLEAN NOT NULL DEFAULT false,
    `y3Work` BOOLEAN NOT NULL DEFAULT false,
    `y3Accepted` BOOLEAN NOT NULL DEFAULT false,
    `y3Other` BOOLEAN NOT NULL DEFAULT false,
    `y3OtherText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AlcoholMember_villageId_idx`(`villageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AlcoholMember` ADD CONSTRAINT `AlcoholMember_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
