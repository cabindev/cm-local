-- AlterTable
ALTER TABLE `Person` ADD COLUMN `consentGiven` BOOLEAN NOT NULL DEFAULT false,
                     ADD COLUMN `consentAt` DATETIME(3) NULL;
