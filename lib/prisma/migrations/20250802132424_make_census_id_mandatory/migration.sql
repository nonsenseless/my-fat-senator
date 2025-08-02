/*
  Warnings:

  - Made the column `censusId` on table `CongressionalSession` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CongressionalSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "censusId" INTEGER NOT NULL,
    CONSTRAINT "CongressionalSession_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "Census" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CongressionalSession" ("censusId", "id", "name", "reviewed", "slug") SELECT "censusId", "id", "name", "reviewed", "slug" FROM "CongressionalSession";
DROP TABLE "CongressionalSession";
ALTER TABLE "new_CongressionalSession" RENAME TO "CongressionalSession";
CREATE UNIQUE INDEX "CongressionalSession_slug_key" ON "CongressionalSession"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
