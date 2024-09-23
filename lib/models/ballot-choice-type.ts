import { PrismaClient } from '@prisma/client';

import { IBallot } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class BallotChoiceTypeService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateBallotChoiceType = async (record: IBallot) => {
		console.log('Creating ballot choice type: ', record.vote)
		const incoming = await this.database.ballotChoiceType.findFirst({
			where: {
				name: record.vote
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.ballotChoiceType.upsert({
			where: {
				slug: Utilities.slugify(record.vote),
			},
			update: {},
			create: {
				name: record.vote,
				slug: Utilities.slugify(record.vote),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}