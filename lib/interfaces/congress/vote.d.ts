export namespace CongressAPI {
  export interface IVote	 {
    category: string
    chamber: string
    congress: number
    date: string
    number: number
    question: string
    requires: string
    result: string
    result_text: string
    session: string
    source_url: string
    type: string
    updated_at: string
    vote_id: string
    votes: IBallots
    ballots: IBallot[]
  }

  export enum VoteType {
    NOT_VOTING = "Not Voting",
    PRESENT = "Present",
    NAY = "Nay",
    YEA = "Yea"
  }

  export interface IBallots {
    [VoteType.NOT_VOTING]: IBallot[]	
    [VoteType.PRESENT]: IBallot[]	
    [VoteType.NAY]: IBallot[]	
    [VoteType.YEA]: IBallot[]	
  }

  // TODO In Prisma schema, we're calling this a ballot
  export interface IBallot {
    display_name: string
    /** This is the bioguide id from the congressional API */
    id: string
    party: string
    state: string
    first_name: string
    last_name: string
    vote: VoteType
  }
}