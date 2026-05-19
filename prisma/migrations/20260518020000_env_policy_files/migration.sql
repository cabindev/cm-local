-- AlterTable: add file attachment fields for policy and community rule
ALTER TABLE `EnvItem`
    ADD COLUMN `communityRuleFileName` VARCHAR(191) NULL,
    ADD COLUMN `communityRuleFileUrl`  VARCHAR(191) NULL,
    ADD COLUMN `policyFileName`        VARCHAR(191) NULL,
    ADD COLUMN `policyFileUrl`         VARCHAR(191) NULL;
