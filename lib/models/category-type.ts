import { PrismaClient } from '@prisma/client';

import { IVote } from '../interfaces/congress/vote';
import { Utilities } from '../services/utlilities';

export class CategoryTypeService {
	constructor(private database: PrismaClient) {

	}

	getOrCreateCategoryType = async (record: IVote) => {
		const incoming = await this.database.categoryType.findFirst({
			where: {
				name: record.category
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.categoryType.create({
			data: {
				name: record.category,
				slug: Utilities.slugify(record.category),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}