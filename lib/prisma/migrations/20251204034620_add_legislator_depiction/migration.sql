-- CreateTable
CREATE TABLE "LegislatorDepiction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "attributionUrl" TEXT NOT NULL,
    "legislatorId" INTEGER NOT NULL,
    CONSTRAINT "LegislatorDepiction_legislatorId_fkey" FOREIGN KEY ("legislatorId") REFERENCES "Legislator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LegislatorDepiction_legislatorId_key" ON "LegislatorDepiction"("legislatorId");
