/*
  Warnings:

  - You are about to drop the `CongressVoteImport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CongressVoteImport";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "VoteImport" (
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
    "sourceUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "vote_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "chamberId" INTEGER NOT NULL,
    "congressId" INTEGER NOT NULL,
    "requiresTypeId" INTEGER NOT NULL,
    "resultTypeId" INTEGER NOT NULL,
    "voteTypeId" INTEGER NOT NULL,
    "session" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "last_updated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vote_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "Chamber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_congressId_fkey" FOREIGN KEY ("congressId") REFERENCES "CongressionalSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_requiresTypeId_fkey" FOREIGN KEY ("requiresTypeId") REFERENCES "RequiresType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_resultTypeId_fkey" FOREIGN KEY ("resultTypeId") REFERENCES "ResultType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_voteTypeId_fkey" FOREIGN KEY ("voteTypeId") REFERENCES "VoteType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "legislatorId" TEXT NOT NULL,
    "ballotChoiceId" INTEGER NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "voteId" INTEGER NOT NULL,
    "ballotChoiceTypeId" INTEGER NOT NULL,
    CONSTRAINT "Ballot_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ballot_ballotChoiceId_fkey" FOREIGN KEY ("ballotChoiceId") REFERENCES "BallotChoiceType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BallotChoiceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "CategoryType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Chamber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "CongressionalSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Legislator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "partyId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    CONSTRAINT "Legislator_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Legislator_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequiresType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "ResultType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Party" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "VoteType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL
);
