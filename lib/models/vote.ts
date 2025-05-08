import { PrismaClient } from '@prisma/client';

import { IBallot, IBallots, IVote, IVoteType } from '../interfaces/';
import { BallotService } from '../models/ballot';
import { CategoryTypeService } from '../models/category-type';
import { ChamberService } from '../models/chamber';
import { CongressionalSessionService } from '../models/congressional-session';
import { RequiresTypeService } from '../models/requires-type';
import { ResultTypeService } from '../models/result-type';
import { VoteTypeService } from '../models/vote-type';
import { FileService } from '../services/file.service';

export class VoteService {
	constructor(private database: PrismaClient,
		private ballotService: BallotService,
		private categoryTypeService: CategoryTypeService,
		private chamberService: ChamberService,
		private congressionalSessionService: CongressionalSessionService,
		private requiresTypeService: RequiresTypeService,
		private resultTypeService: ResultTypeService,
		private voteTypeService: VoteTypeService
	) {

	}

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
			const votesOfType = votes[type] || [];
			file.ballots = file.ballots.concat(votesOfType.map((vote: IBallot) => {
				vote.vote = type; 
				return vote;
			}));
		})
		console.log('Ballots is now ', file.ballots);

		return file;
	}

	async getOrCreateVote(record: IVote) {
		let vote = await this.database.vote.findFirst({
			where: {
				congressional_vote_id: record.vote_id
			}
		})

		if (vote) {
			return vote;
		}

		const categoryType = await this.categoryTypeService.getOrCreateCategoryType(record);
		console.log('Yielded ', categoryType.id);
	
		const chamber = await this.chamberService.getOrCreateChamber(record);
		console.log('Yielded ', chamber.id);

		const congressionalSession = await this.congressionalSessionService.getOrCreateCongressionalSession(record);
		console.log('Yielded ', congressionalSession.id);
	
		const requiresType = await this.requiresTypeService.getOrCreateRequiresType(record);
		console.log('Yielded ', requiresType.id);

		const resultType = await this.resultTypeService.getOrCreateResultType(record);
		console.log('Yielded ', resultType.id);

		const voteType = await this.voteTypeService.getOrCreateVoteType(record);
		console.log('Yielded ', voteType.id);

		vote = await this.database.vote.create({
			data: {
				categoryId: categoryType.id,
				chamberId: chamber.id,
				congressionalSessionId: congressionalSession.id,
				requiresTypeId: requiresType.id,
				resultTypeId: resultType.id,
				voteTypeId: voteType.id,
				congressional_vote_id: record.vote_id,
				congressional_updated_at: record.updated_at,
				session: record.session,
				sourceUrl: record.source_url
			}
		})

		const ballots = await this.ballotService.getOrCreateBallots(vote.id, record.ballots);
		console.log('Ballots: ', ballots);
		return this.database.vote.findFirst({
			where: {
				id: vote.id
			},
			include: {
				ballots: true
			}
		});
	}

}