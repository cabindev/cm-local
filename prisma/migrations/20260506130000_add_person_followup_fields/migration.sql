-- Rename status -> statusY1 and add follow-up fields for PersonAlcohol
ALTER TABLE `PersonAlcohol`
  CHANGE COLUMN `status` `statusY1` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',
  ADD COLUMN `statusY2` VARCHAR(191) NULL,
  ADD COLUMN `statusY3` VARCHAR(191) NULL,
  ADD COLUMN `noteY1`   LONGTEXT NULL,
  ADD COLUMN `noteY2`   LONGTEXT NULL,
  ADD COLUMN `noteY3`   LONGTEXT NULL;

-- Rename status -> statusY1 and add follow-up fields for PersonTobacco
ALTER TABLE `PersonTobacco`
  CHANGE COLUMN `status` `statusY1` VARCHAR(191) NOT NULL DEFAULT 'ตั้งใจเลิก',
  ADD COLUMN `statusY2` VARCHAR(191) NULL,
  ADD COLUMN `statusY3` VARCHAR(191) NULL,
  ADD COLUMN `noteY1`   LONGTEXT NULL,
  ADD COLUMN `noteY2`   LONGTEXT NULL,
  ADD COLUMN `noteY3`   LONGTEXT NULL;

-- Add year results for PersonDnd
ALTER TABLE `PersonDnd`
  ADD COLUMN `year1Result` LONGTEXT NULL,
  ADD COLUMN `year2Result` LONGTEXT NULL,
  ADD COLUMN `year3Result` LONGTEXT NULL;
