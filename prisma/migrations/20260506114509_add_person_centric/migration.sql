-- CreateTable
CREATE TABLE `Person` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Person_villageId_idx`(`villageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonAlcohol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL DEFAULT 'เสี่ยงต่ำ',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',

    UNIQUE INDEX `PersonAlcohol_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonTobacco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `smokeType` VARCHAR(191) NOT NULL DEFAULT 'สูบประจำ',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',

    UNIQUE INDEX `PersonTobacco_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonDnd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL DEFAULT 'เสี่ยงต่ำ',

    UNIQUE INDEX `PersonDnd_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Person` ADD CONSTRAINT `Person_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonAlcohol` ADD CONSTRAINT `PersonAlcohol_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonTobacco` ADD CONSTRAINT `PersonTobacco_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonDnd` ADD CONSTRAINT `PersonDnd_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
