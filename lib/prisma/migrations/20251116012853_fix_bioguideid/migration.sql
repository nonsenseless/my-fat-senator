/*
  Warnings:

  - Added the required column `lis_member_id` to the `Legislator` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Legislator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bioguideid" TEXT NOT NULL,
    "lis_member_id" TEXT NULL,
    "displayName" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "partyId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    CONSTRAINT "Legislator_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Legislator_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Legislator" ("bioguideid", "displayName", "firstName", "id", "lastName", "partyId", "reviewed", "stateId", "lis_member_id")
SELECT "bioguideid", "displayName", "firstName", "id", "lastName", "partyId", "reviewed", "stateId", "bioguideid" FROM "Legislator";

-- In our data source, senate votes have LIS member id as the id; house votes use bioguide id
-- Database currently still has house members in it so not everybody is a senator
-- Chamber isn't set directly on legislator because they can fill multiple roles
-- Fortunately, LIS member ids are only 4 characters and bioguideids are longer so.
UPDATE "new_Legislator"
SET "lis_member_id" = null
WHERE length("lis_member_id") > 4;

DROP TABLE "Legislator";
ALTER TABLE "new_Legislator" RENAME TO "Legislator";
CREATE UNIQUE INDEX "Legislator_bioguideid_key" ON "Legislator"("bioguideid");
CREATE UNIQUE INDEX "Legislator_lis_member_id_key" ON "Legislator"("lis_member_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
