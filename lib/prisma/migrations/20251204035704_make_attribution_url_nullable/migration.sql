-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LegislatorDepiction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "attributionUrl" TEXT,
    "legislatorId" INTEGER NOT NULL,
    CONSTRAINT "LegislatorDepiction_legislatorId_fkey" FOREIGN KEY ("legislatorId") REFERENCES "Legislator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LegislatorDepiction" ("attributionUrl", "id", "imageUrl", "legislatorId") SELECT "attributionUrl", "id", "imageUrl", "legislatorId" FROM "LegislatorDepiction";
DROP TABLE "LegislatorDepiction";
ALTER TABLE "new_LegislatorDepiction" RENAME TO "LegislatorDepiction";
CREATE UNIQUE INDEX "LegislatorDepiction_legislatorId_key" ON "LegislatorDepiction"("legislatorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
