/*
  Warnings:

  - You are about to drop the column `sourceUrl` on the `VoteImport` table. All the data in the column will be lost.
  - Added the required column `source_url` to the `VoteImport` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VoteImport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rawData" TEXT NOT NULL,
    "importErrors" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "category" TEXT NOT NULL,
    "chamber" TEXT NOT NULL,
    "congress" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "number" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "requires" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "resultText" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "vote_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VoteImport" ("category", "chamber", "congress", "createdAt", "date", "id", "importErrors", "number", "processed", "question", "rawData", "requires", "result", "resultText", "session", "type", "updatedAt", "updated_at", "vote_id") SELECT "category", "chamber", "congress", "createdAt", "date", "id", "importErrors", "number", "processed", "question", "rawData", "requires", "result", "resultText", "session", "type", "updatedAt", "updated_at", "vote_id" FROM "VoteImport";
DROP TABLE "VoteImport";
ALTER TABLE "new_VoteImport" RENAME TO "VoteImport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
