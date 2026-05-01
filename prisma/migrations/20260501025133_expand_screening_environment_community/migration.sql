/*
  Warnings:

  - You are about to drop the column `banAdvertisingCount` on the `Environment` table. All the data in the column will be lost.
  - You are about to drop the column `banSaleCount` on the `Environment` table. All the data in the column will be lost.
  - You are about to drop the column `policyCount` on the `Environment` table. All the data in the column will be lost.
  - You are about to drop the column `alcoholRiskHigh` on the `ScreeningResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalPopulation` on the `ScreeningResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CommunityParticipation` ADD COLUMN `hasHealthStation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasLocalGov` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasOrganization` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasSchool` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasTemple` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasVillageAdmin` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Environment` DROP COLUMN `banAdvertisingCount`,
    DROP COLUMN `banSaleCount`,
    DROP COLUMN `policyCount`,
    ADD COLUMN `bannedPlaceCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `funeralAlcoholFree` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `shopCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `traditionAlcoholFree` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `ScreeningResult` DROP COLUMN `alcoholRiskHigh`,
    DROP COLUMN `totalPopulation`,
    ADD COLUMN `alcoholAddicted` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `alcoholDanger` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `alcoholNone` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `alcoholRisk` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `drinkAndDrive` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `drinkNotDriveN` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tobaccoNone` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Village` ADD COLUMN `actualPopulation` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `householdCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `registeredPopulation` INTEGER NOT NULL DEFAULT 0;
