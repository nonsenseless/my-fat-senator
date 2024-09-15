import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class RequiresTypeService {
	constructor(private database: PrismaClient) {

	}
	getOrCreateRequiresType = async (record: IVote) => {
		console.log('Creating requires type: ', record.requires)
		const incoming = await this.database.requiresType.findFirst({
			where: {
				name: record.requires
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.requiresType.create({
			data: {
				name: record.requires,
				slug: Utilities.slugify(record.requires),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}