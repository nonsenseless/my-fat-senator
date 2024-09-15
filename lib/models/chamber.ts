import { PrismaClient } from '@prisma/client';

import { CongressAPI } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class ChamberService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateChamber = async (record: CongressAPI.IVote) => {
		console.log('Creating chamber: ', record.chamber)
		const incoming = await this.database.chamber.findFirst({
			where: {
				name: record.chamber
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.chamber.create({
			data: {
				name: record.chamber,
				slug: Utilities.slugify(record.chamber),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}