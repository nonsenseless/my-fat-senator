import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces';
import { Utilities } from '../services/utlilities';

export class ChamberService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateChamber = async (record: IVote) => {
		console.log('Creating chamber: ', record.chamber)
		const incoming = await this.database.chamber.findFirst({
			where: {
				name: record.chamber
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.chamber.upsert({
			where: {
				slug: Utilities.slugify(record.chamber),
			},
			update: {},
			create: {
				name: record.chamber,
				slug: Utilities.slugify(record.chamber),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}