import type { VoteImport } from "@prisma/client";

import { prisma } from "./db.server";

export function getCongressVoteImport({
  id
}: Pick<VoteImport, "id"> & {
  id: VoteImport["id"];
}) {
  return prisma.voteImport.findFirst({
    select: { id: true, rawData: true, processed: true },
    where: { id },
  });
}

export function deleteCongressVoteImport({
  id
}: Pick<VoteImport, "id">) {
  return prisma.voteImport.deleteMany({
    where: { id },
  });
}