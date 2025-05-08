import { Ballot, PrismaClient  } from '@prisma/client';

import { IBallot } from '../interfaces/';

import { BallotChoiceTypeService } from './ballot-choice-type';
import { LegislatorService } from './legislator';

export class BallotService {
	constructor(private database: PrismaClient,
		private ballotChoiceTypeService: BallotChoiceTypeService,
		private legislatorService: LegislatorService
	) {

	}

	async getOrCreateBallot(voteId: number, ballot: IBallot) : Promise<Ballot> {
		const legislator = await this.legislatorService.getOrCreateLegislator(ballot);

		// If there are multiple records for the same combination of vote and legislator we need to know
		// This won't catch if there are multiple records for the same legislator. 
		const existing = await this.database.ballot.findFirst({
			where: {
				voteId,
				legislatorId: legislator.id
			}
		})

		if (existing) {
			return existing;
		}

		const ballotChoiceType = await this.ballotChoiceTypeService.getOrCreateBallotChoiceType(ballot);

		return await this.database.ballot.create({
			data: {
				reviewed: false,
				voteId,
				legislatorId: legislator.id,
				ballotChoiceTypeId: ballotChoiceType.id
			}
		})
	}

	/**
	 * This function takes a set of incoming ballots from a IVote
	 * and either finds an existing record or creates one.
	 * @param incoming
	 * @returns 
	 */
	async getOrCreateBallots(voteId: number, incoming: IBallot[]){
		for (const record of incoming) {
			await this.getOrCreateBallot(voteId, record);
		}
	}
}