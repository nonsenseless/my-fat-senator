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
  votes: IVotes
}

export enum VoteType {
  NOT_VOTING = "Not Voting",
  PRESENT = "Present",
  NAY = "Nay",
  YEA = "Yea"
}

export interface IVotes {
	[VoteType.NOT_VOTING]: IVoteRecord[]	
	[VoteType.PRESENT]: IVoteRecord[]	
	[VoteType.NAY]: IVoteRecord[]	
	[VoteType.YEA]: IVoteRecord[]	
}

// TODO In Prisma schema, we're calling this a ballot
export interface IVoteRecord {
  display_name: string
  id: string
  party: string
  state: string
  first_name: string
  last_name: string
  vote: string
}