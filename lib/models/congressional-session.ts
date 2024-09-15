import { PrismaClient } from '@prisma/client';

import { CongressAPI } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class CongressionalSessionService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateCongressionalSession = async (record: CongressAPI.IVote) => {
		console.log('Creating congressional session: ', record.session)
		const incoming = await this.database.congressionalSession.findFirst({
			where: {
				name: record.session
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.congressionalSession.create({
			data: {
				name: record.session,
				slug: Utilities.slugify(record.session),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}