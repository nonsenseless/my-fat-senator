/*
  Warnings:

  - You are about to drop the column `last_updated` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `congressional_updated_at` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `congressional_vote_id` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "chamberId" INTEGER NOT NULL,
    "congressId" INTEGER NOT NULL,
    "requiresTypeId" INTEGER NOT NULL,
    "resultTypeId" INTEGER NOT NULL,
    "voteTypeId" INTEGER NOT NULL,
    "session" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "congressional_updated_at" DATETIME NOT NULL,
    "congressional_vote_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vote_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "Chamber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_congressId_fkey" FOREIGN KEY ("congressId") REFERENCES "CongressionalSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_requiresTypeId_fkey" FOREIGN KEY ("requiresTypeId") REFERENCES "RequiresType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_resultTypeId_fkey" FOREIGN KEY ("resultTypeId") REFERENCES "ResultType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_voteTypeId_fkey" FOREIGN KEY ("voteTypeId") REFERENCES "VoteType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("categoryId", "chamberId", "congressId", "createdAt", "id", "requiresTypeId", "resultTypeId", "session", "sourceUrl", "updatedAt", "voteTypeId") SELECT "categoryId", "chamberId", "congressId", "createdAt", "id", "requiresTypeId", "resultTypeId", "session", "sourceUrl", "updatedAt", "voteTypeId" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
