import type { CongressVoteImport } from "@prisma/client";

import { prisma } from "~/db.server";

export function getCongressVoteImport({
  id
}: Pick<CongressVoteImport, "id"> & {
  id: CongressVoteImport["id"];
}) {
  return prisma.congressVoteImport.findFirst({
    select: { id: true, rawData: true, processed: true },
    where: { id },
  });
}

export function deleteCongressVoteImport({
  id
}: Pick<CongressVoteImport, "id">) {
  return prisma.congressVoteImport.deleteMany({
    where: { id },
  });
}