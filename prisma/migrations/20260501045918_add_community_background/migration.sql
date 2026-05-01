-- CreateTable
CREATE TABLE `CommunityBackground` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `hasItem` BOOLEAN NOT NULL DEFAULT false,
    `fileUrl` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,

    INDEX `CommunityBackground_villageId_idx`(`villageId`),
    UNIQUE INDEX `CommunityBackground_villageId_itemType_key`(`villageId`, `itemType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CommunityBackground` ADD CONSTRAINT `CommunityBackground_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
