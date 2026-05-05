-- AlterTable
ALTER TABLE `Village` ADD COLUMN `creatorId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Village_creatorId_idx` ON `Village`(`creatorId`);

-- AddForeignKey
ALTER TABLE `Village` ADD CONSTRAINT `Village_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
