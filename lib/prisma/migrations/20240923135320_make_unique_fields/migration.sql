/*
  Warnings:

  - A unique constraint covering the columns `[voteId,legislatorId]` on the table `Ballot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `BallotChoiceType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `CategoryType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Chamber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `CongressionalSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bioguideid]` on the table `Legislator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Party` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `RequiresType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ResultType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shortName]` on the table `State` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[congressional_vote_id]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vote_id]` on the table `VoteImport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `VoteType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ballot_voteId_legislatorId_key" ON "Ballot"("voteId", "legislatorId");

-- CreateIndex
CREATE UNIQUE INDEX "BallotChoiceType_slug_key" ON "BallotChoiceType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryType_slug_key" ON "CategoryType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chamber_slug_key" ON "Chamber"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CongressionalSession_slug_key" ON "CongressionalSession"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Legislator_bioguideid_key" ON "Legislator"("bioguideid");

-- CreateIndex
CREATE UNIQUE INDEX "Party_slug_key" ON "Party"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RequiresType_slug_key" ON "RequiresType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ResultType_slug_key" ON "ResultType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "State_shortName_key" ON "State"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_congressional_vote_id_key" ON "Vote"("congressional_vote_id");

-- CreateIndex
CREATE UNIQUE INDEX "VoteImport_vote_id_key" ON "VoteImport"("vote_id");

-- CreateIndex
CREATE UNIQUE INDEX "VoteType_slug_key" ON "VoteType"("slug");
