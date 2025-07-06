-- CreateTable
CREATE TABLE "Census" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StateCensus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "censusId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "population" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StateCensus_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "Census" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StateCensus_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CongressionalSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL,
    "censusId" INTEGER,
    CONSTRAINT "CongressionalSession_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "Census" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CongressionalSession" ("id", "name", "reviewed", "slug") SELECT "id", "name", "reviewed", "slug" FROM "CongressionalSession";
DROP TABLE "CongressionalSession";
ALTER TABLE "new_CongressionalSession" RENAME TO "CongressionalSession";
CREATE UNIQUE INDEX "CongressionalSession_slug_key" ON "CongressionalSession"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Census_year_key" ON "Census"("year");

-- CreateIndex
CREATE UNIQUE INDEX "StateCensus_censusId_stateId_key" ON "StateCensus"("censusId", "stateId");
