import { PrismaClient, VoteType } from '@prisma/client';

import { IVote } from '../interfaces';
import { Utilities } from '../services/utlilities';

export class VoteTypeService {
	constructor(private database: PrismaClient) {

	}

	getVoteTypes = async (): Promise<VoteType[]> => {
		const voteTypes = await this.database.voteType.findMany();
		return voteTypes;
	};

	getOrCreateVoteType = async (record: IVote) => {
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