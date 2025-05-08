import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces';
import { Utilities } from '../services/utlilities';

export class CongressionalSessionService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateCongressionalSession = async (record: IVote) => {
		console.log('Creating congressional session: ', record.session)
		const incoming = await this.database.congressionalSession.findFirst({
			where: {
				name: record.session
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.congressionalSession.upsert({
			where: {
				slug: Utilities.slugify(record.session),
			},
			update: {},
			create: {
				name: record.session,
				slug: Utilities.slugify(record.session),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}