-- CreateTable
CREATE TABLE "CongressionalLegislatorRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bioguideid" TEXT,
    "rawData" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingErrorMessage" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "CongressionalLegislatorRecord_bioguideid_idx" ON "CongressionalLegislatorRecord"("bioguideid");
