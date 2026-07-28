-- Set Croatian (hr) as the default document language.
--
-- Part 1 changes the column defaults so newly created rows are Croatian.
-- Part 2 backfills rows that still carry the old 'en' default.

-- AlterTable
ALTER TABLE "DocumentMeta" ALTER COLUMN "language" SET DEFAULT 'hr';

-- AlterTable
ALTER TABLE "OrganisationGlobalSettings" ALTER COLUMN "documentLanguage" SET DEFAULT 'hr';

-- Backfill existing rows.
--
-- NOTE: 'en' is indistinguishable here between "left at the old default" and
-- "deliberately chosen by the user". This migration treats all of them as the
-- old default. If this instance has organisations that intentionally send
-- English documents, delete the two UPDATE statements below before applying.
UPDATE "OrganisationGlobalSettings" SET "documentLanguage" = 'hr' WHERE "documentLanguage" = 'en';

-- Only touch drafts. Documents that are already pending or completed have had
-- their language baked into emails the recipient has seen, so changing it now
-- would make follow-up mail inconsistent with what was already delivered.
UPDATE "DocumentMeta"
SET "language" = 'hr'
WHERE "language" = 'en'
  AND "id" IN (
    SELECT "documentMetaId"
    FROM "Envelope"
    WHERE "status" = 'DRAFT'
  );
