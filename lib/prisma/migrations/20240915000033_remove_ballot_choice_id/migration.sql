/*
  Warnings:

  - You are about to drop the column `ballotChoiceId` on the `Ballot` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ballot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "legislatorId" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "voteId" INTEGER NOT NULL,
    "ballotChoiceTypeId" INTEGER NOT NULL,
    CONSTRAINT "Ballot_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ballot_ballotChoiceTypeId_fkey" FOREIGN KEY ("ballotChoiceTypeId") REFERENCES "BallotChoiceType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ballot" ("ballotChoiceTypeId", "id", "legislatorId", "reviewed", "voteId") SELECT "ballotChoiceTypeId", "id", "legislatorId", "reviewed", "voteId" FROM "Ballot";
DROP TABLE "Ballot";
ALTER TABLE "new_Ballot" RENAME TO "Ballot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
