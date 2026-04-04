-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Legislator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bioguideid" TEXT NOT NULL,
    "lis_member_id" TEXT,
    "displayName" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "partyId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "unprocessable" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Legislator_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Legislator_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Legislator" ("bioguideid", "displayName", "firstName", "id", "lastName", "lis_member_id", "partyId", "reviewed", "stateId") SELECT "bioguideid", "displayName", "firstName", "id", "lastName", "lis_member_id", "partyId", "reviewed", "stateId" FROM "Legislator";
DROP TABLE "Legislator";
ALTER TABLE "new_Legislator" RENAME TO "Legislator";
CREATE UNIQUE INDEX "Legislator_bioguideid_key" ON "Legislator"("bioguideid");
CREATE UNIQUE INDEX "Legislator_lis_member_id_key" ON "Legislator"("lis_member_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
