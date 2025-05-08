import { IBallot } from "./ballot.interface"
import { IVoteType } from "./vote-type.enum"

// It was a mistake to name this so similar to IBallot.
export interface IBallots {
  [IVoteType.NOT_VOTING]: IBallot[]
  [IVoteType.PRESENT]: IBallot[]
  [IVoteType.NAY]: IBallot[]
  [IVoteType.YEA]: IBallot[]
}