import { IVoteType } from "./vote-type.enum"

// TODO In Prisma schema, we're calling this a ballot
export interface IBallot {
  display_name: string
  /** This is the bioguide id from the congressional API */
  id: string
  party: string
  state: string
  first_name: string
  last_name: string
  vote: IVoteType
}