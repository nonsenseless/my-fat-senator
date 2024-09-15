import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class ResultTypeService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateResultType = async (record: IVote) => {
		console.log('Creating result type: ', record.result)
		const incoming = await this.database.resultType.findFirst({
			where: {
				name: record.result
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.resultType.create({
			data: {
				name: record.result,
				slug: Utilities.slugify(record.result),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}