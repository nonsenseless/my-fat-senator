import { PrismaClient } from '@prisma/client';

import { CongressAPI } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class PartyService {
	constructor(private database: PrismaClient) {

	}
	getOrCreateParty = async (record: CongressAPI.IBallot) => {
		console.log('Creating party: ', record.party)
		const incoming = await this.database.party.findFirst({
			where: {
				name: record.party
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.party.create({
			data: {
				name: record.party,
				slug: Utilities.slugify(record.party),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}