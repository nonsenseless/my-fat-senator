-- CreateTable
CREATE TABLE "CongressVoteImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawData" TEXT NOT NULL,
    "importErrors" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
