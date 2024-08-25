/*
  Warnings:

  - The primary key for the `CongressVoteImport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CongressVoteImport` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CongressVoteImport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rawData" TEXT NOT NULL,
    "importErrors" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CongressVoteImport" ("createdAt", "id", "importErrors", "processed", "rawData", "updatedAt") SELECT "createdAt", "id", "importErrors", "processed", "rawData", "updatedAt" FROM "CongressVoteImport";
DROP TABLE "CongressVoteImport";
ALTER TABLE "new_CongressVoteImport" RENAME TO "CongressVoteImport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
