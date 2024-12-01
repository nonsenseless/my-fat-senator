import { Ballot } from "@prisma/client"

import { IVoteType } from "./congress/vote"

export interface IBallotChoiceMap {
  [IVoteType.NOT_VOTING]: Ballot[]
  [IVoteType.PRESENT]: Ballot[]
  [IVoteType.NAY]: Ballot[]
  [IVoteType.YEA]: Ballot[]
}