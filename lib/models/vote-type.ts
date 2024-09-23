import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class VoteTypeService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateVoteType = async (record: IVote) => {
		console.log('Creating vote type: ', record.type)
		const incoming = await this.database.voteType.findFirst({
			where: {
				name: record.type
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.voteType.upsert({
			where: {
				slug: Utilities.slugify(record.type),
			},
			update: {},
			create: {
				name: record.type,
				slug: Utilities.slugify(record.type),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}

}