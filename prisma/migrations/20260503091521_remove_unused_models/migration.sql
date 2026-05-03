/*
  Warnings:

  - You are about to drop the `AlcoholParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlcoholResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DrinkNotDrive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TobaccoParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TobaccoResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AlcoholParticipant` DROP FOREIGN KEY `AlcoholParticipant_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `AlcoholResult` DROP FOREIGN KEY `AlcoholResult_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityStats` DROP FOREIGN KEY `CommunityStats_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `DrinkNotDrive` DROP FOREIGN KEY `DrinkNotDrive_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `TobaccoParticipant` DROP FOREIGN KEY `TobaccoParticipant_villageId_fkey`;

-- DropForeignKey
ALTER TABLE `TobaccoResult` DROP FOREIGN KEY `TobaccoResult_villageId_fkey`;

-- DropTable
DROP TABLE `AlcoholParticipant`;

-- DropTable
DROP TABLE `AlcoholResult`;

-- DropTable
DROP TABLE `CommunityStats`;

-- DropTable
DROP TABLE `DrinkNotDrive`;

-- DropTable
DROP TABLE `TobaccoParticipant`;

-- DropTable
DROP TABLE `TobaccoResult`;
