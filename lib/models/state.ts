import { PrismaClient } from '@prisma/client';

import { IBallot } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class StateService {
	constructor(private database: PrismaClient) {

	}
	getOrCreateState = async (record: IBallot) => {
		console.log('Creating state: ', record.state)
		const incoming = await this.database.state.findFirst({
			where: {
				name: record.state
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.state.create({
			data: {
				name: record.state,
				shortName: Utilities.slugify(record.state),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}