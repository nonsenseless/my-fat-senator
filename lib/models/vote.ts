import { PrismaClient } from '@prisma/client';

import { IBallot, IBallots, IVote, IVoteType } from '../interfaces/congress/vote';
import { FileService } from '../services/file.service';
import { Utilities } from '../services/utlilities';

export class VoteService {
	constructor(private database: PrismaClient) { }

	/**
	 * Imports a vote from a Congress Vote file to local schema. Only supports JSON files.
	 * @param path 
	 * @returns Vote or null if the path didn't resolve.
	 */
	async importVote(path: string) {
		const file = this.fileToVote(path);
		if (file) {
			return this.getOrCreateVote(file);
		}
		return Promise.resolve(null);
	}

	/**
	 * Massages data from the format provided by congress to match our internal schema.
	 * @param path
	 * @returns 
	 */
	private fileToVote(path: string): IVote | null {
		console.log("Converting file at path ", path);
		const file = FileService.tryGetJSON(path) as IVote;
		if (!file) {
			return null;
		}
		file.ballots = [];
		const votes = file.votes as IBallots;
		if (votes == null) {
			return null;
		}

		// Congress doesn't actually put the vote *on* the vote record so we have to massage it.
		Object.values(IVoteType).forEach((type: IVoteType) => {
			const addedVotes = votes[type];
			if (addedVotes) {
				file.ballots = file.ballots.concat(addedVotes.map((vote: IBallot) => {
					vote.vote = type;
					return vote;
				}));
			}
		})

		return file;
	}

	async getOrCreateVote(record: IVote) {
		const vote = await this.database.vote.findFirst({
			where: {
				congressional_vote_id: record.vote_id
			}
		})

		if (vote) {
			return Promise.resolve(vote);
		}

		try {
			console.log("Attempting to create " + record.vote_id);
			return Promise.resolve(this.database.vote.create({
			data: {
				category: {
					create: {
						name: record.category,
						slug: Utilities.slugify(record.category),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				chamber: {
					create: {
						name: record.chamber,
						slug: Utilities.slugify(record.chamber),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				congressionalSession: {
					create: {
						name: record.session,
						slug: Utilities.slugify(record.session),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				requiresType: {
					create: {
						name: record.requires,
						slug: Utilities.slugify(record.requires),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				resultType: {
					create: {
						name: record.result,
						slug: Utilities.slugify(record.result),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				voteType: {
					create: {
						name: record.type,
						slug: Utilities.slugify(record.type),
						reviewed: false // TODO I suppose this should have a default
					}
				},
				congressional_vote_id: record.vote_id,
				congressional_updated_at: record.updated_at,
				session: record.session,
				sourceUrl: record.source_url,
			}
		}));
		} catch (error) {
			console.error("Failed with error ", JSON.stringify(error));
			return Promise.reject(error);
		}
	}
}