/*
  Warnings:

  - You are about to drop the column `y1AcceptedText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y1FamilyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y1HealthText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y1MoneyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y1PropertyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y1WorkText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2AcceptedText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2FamilyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2HealthText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2MoneyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2PropertyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y2WorkText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3AcceptedText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3FamilyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3HealthText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3MoneyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3PropertyText` on the `AlcoholMember` table. All the data in the column will be lost.
  - You are about to drop the column `y3WorkText` on the `AlcoholMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `AlcoholMember` DROP COLUMN `y1AcceptedText`,
    DROP COLUMN `y1FamilyText`,
    DROP COLUMN `y1HealthText`,
    DROP COLUMN `y1MoneyText`,
    DROP COLUMN `y1PropertyText`,
    DROP COLUMN `y1WorkText`,
    DROP COLUMN `y2AcceptedText`,
    DROP COLUMN `y2FamilyText`,
    DROP COLUMN `y2HealthText`,
    DROP COLUMN `y2MoneyText`,
    DROP COLUMN `y2PropertyText`,
    DROP COLUMN `y2WorkText`,
    DROP COLUMN `y3AcceptedText`,
    DROP COLUMN `y3FamilyText`,
    DROP COLUMN `y3HealthText`,
    DROP COLUMN `y3MoneyText`,
    DROP COLUMN `y3PropertyText`,
    DROP COLUMN `y3WorkText`;

-- AlterTable
ALTER TABLE `Person` ADD COLUMN `gender` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PersonAlcohol` ADD COLUMN `y1MoneyNote` LONGTEXT NULL,
    ADD COLUMN `y2MoneyNote` LONGTEXT NULL,
    ADD COLUMN `y3MoneyNote` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `PersonTobacco` ADD COLUMN `y1MoneyNote` LONGTEXT NULL,
    ADD COLUMN `y2MoneyNote` LONGTEXT NULL,
    ADD COLUMN `y3MoneyNote` LONGTEXT NULL;
