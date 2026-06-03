-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('MEMBER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'MEMBER',
    `province` VARCHAR(191) NULL,
    `amphoe` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `zone` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenCreatedAt` DATETIME(3) NULL,
    `resetTokenExpiresAt` DATETIME(3) NULL,
    `lastPasswordReset` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_resetToken_key`(`resetToken`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `registeredPopulation` INTEGER NOT NULL DEFAULT 0,
    `actualPopulation` INTEGER NOT NULL DEFAULT 0,
    `householdCount` INTEGER NOT NULL DEFAULT 0,
    `creatorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Village_province_idx`(`province`),
    INDEX `Village_amphoe_idx`(`amphoe`),
    INDEX `Village_tambon_idx`(`tambon`),
    INDEX `Village_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScreeningResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `screenedCount` INTEGER NOT NULL DEFAULT 0,
    `alcoholRiskLow` INTEGER NOT NULL DEFAULT 0,
    `alcoholRisk` INTEGER NOT NULL DEFAULT 0,
    `alcoholDanger` INTEGER NOT NULL DEFAULT 0,
    `alcoholAddicted` INTEGER NOT NULL DEFAULT 0,
    `alcoholNone` INTEGER NOT NULL DEFAULT 0,
    `tobaccoCount` INTEGER NOT NULL DEFAULT 0,
    `tobaccoNone` INTEGER NOT NULL DEFAULT 0,
    `drinkAndDrive` INTEGER NOT NULL DEFAULT 0,
    `drinkNotDriveN` INTEGER NOT NULL DEFAULT 0,

    INDEX `ScreeningResult_villageId_idx`(`villageId`),
    UNIQUE INDEX `ScreeningResult_villageId_year_key`(`villageId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `EnvItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `hasItem` BOOLEAN NOT NULL DEFAULT false,
    `hasPolicy` BOOLEAN NULL,
    `policyFileUrl` VARCHAR(191) NULL,
    `policyFileName` VARCHAR(191) NULL,
    `hasCommunityRule` BOOLEAN NULL,
    `communityRuleFileUrl` VARCHAR(191) NULL,
    `communityRuleFileName` VARCHAR(191) NULL,
    `hasTraditionEvent` BOOLEAN NULL,
    `traditionEventNames` TEXT NULL,
    `hasNoDrinkSite` BOOLEAN NULL,
    `noDrinkSiteNames` TEXT NULL,
    `noAlcohol` BOOLEAN NULL,
    `shopNames` TEXT NULL,
    `hasShopLegal` BOOLEAN NULL,
    `shopLegalNames` TEXT NULL,

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
    `orgNames` TEXT NULL,

    INDEX `CommunityOrg_villageId_idx`(`villageId`),
    UNIQUE INDEX `CommunityOrg_villageId_orgType_key`(`villageId`, `orgType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Person` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `villageId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    `consentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Person_villageId_idx`(`villageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonOutcome` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `outcomeType` VARCHAR(191) NOT NULL,
    `hasIt` BOOLEAN NOT NULL DEFAULT false,
    `detail` LONGTEXT NULL,
    `moneyNote` LONGTEXT NULL,

    INDEX `PersonOutcome_personId_idx`(`personId`),
    INDEX `PersonOutcome_personId_group_idx`(`personId`, `group`),
    UNIQUE INDEX `PersonOutcome_personId_group_year_outcomeType_key`(`personId`, `group`, `year`, `outcomeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonAlcohol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL DEFAULT 'เสี่ยงต่ำ',
    `statusY1` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',
    `statusY2` VARCHAR(191) NULL,
    `statusY3` VARCHAR(191) NULL,

    UNIQUE INDEX `PersonAlcohol_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonTobacco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `smokeType` VARCHAR(191) NOT NULL DEFAULT 'สูบประจำ',
    `statusY1` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',
    `statusY2` VARCHAR(191) NULL,
    `statusY3` VARCHAR(191) NULL,
    `noteY1` LONGTEXT NULL,

    UNIQUE INDEX `PersonTobacco_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonDnd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `drinkType` VARCHAR(191) NOT NULL DEFAULT 'เสี่ยงต่ำ',
    `year1Result` LONGTEXT NULL,
    `year2Result` LONGTEXT NULL,
    `year3Result` LONGTEXT NULL,

    UNIQUE INDEX `PersonDnd_personId_key`(`personId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Village` ADD CONSTRAINT `Village_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScreeningResult` ADD CONSTRAINT `ScreeningResult_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityBackground` ADD CONSTRAINT `CommunityBackground_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnvItem` ADD CONSTRAINT `EnvItem_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityOrg` ADD CONSTRAINT `CommunityOrg_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Person` ADD CONSTRAINT `Person_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonOutcome` ADD CONSTRAINT `PersonOutcome_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonAlcohol` ADD CONSTRAINT `PersonAlcohol_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonTobacco` ADD CONSTRAINT `PersonTobacco_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonDnd` ADD CONSTRAINT `PersonDnd_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
