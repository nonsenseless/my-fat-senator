import { IBallot } from "./ballot.interface"
import { IBallots } from "./ballots.interface"

export interface IVote {
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





