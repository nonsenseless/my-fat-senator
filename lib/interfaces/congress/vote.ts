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

export interface IVotes {
	"Not Voting": IVoteRecord[]	
	"Present": IVoteRecord[]	
	"Nay": IVoteRecord[]	
	"Yea": IVoteRecord[]	
}

export interface IVoteRecord {
  display_name: string
  id: string
  party: string
  state: string
}