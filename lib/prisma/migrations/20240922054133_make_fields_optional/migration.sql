-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Legislator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bioguideid" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "partyId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    CONSTRAINT "Legislator_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Legislator_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Legislator" ("bioguideid", "displayName", "firstName", "id", "lastName", "partyId", "reviewed", "stateId") SELECT "bioguideid", "displayName", "firstName", "id", "lastName", "partyId", "reviewed", "stateId" FROM "Legislator";
DROP TABLE "Legislator";
ALTER TABLE "new_Legislator" RENAME TO "Legislator";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
