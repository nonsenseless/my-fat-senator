import { CategoryType, PrismaClient, Vote, VoteImport } from '@prisma/client';
import { FileService } from '../services/file.service';
import fs from 'fs';
import { Utilities } from '../services/utlilities';
import { IImportError } from '../interfaces/import-error.interface';
import { IVotes, VoteType } from '../interfaces/congress/vote';

export class Importer {
	files: string[] = [];
	folders: string[] = [];
	errors: IImportError[] = []

	constructor(private database: PrismaClient
	){
	}

	fileToRecord(path: string){
		const file = FileService.tryGetJSON(path);
		// TODO: In theory we should make an import type that matches the file structure exactly and use that to consolidate all the votes but I don't care enough right now.
		let votes = file.votes as IVotes;
		const choices: VoteType[] = [VoteType.NAY, VoteType.NOT_VOTING, VoteType.PRESENT, VoteType.YEA];
		choices.forEach((choice) => {
			votes[choice] = votes[choice].map(vote => {
				vote.vote = choice 
				return vote;
			})
		})
		file.ballots = votes["Nay"].concat(votes["Yea"]).concat(votes["Present"]).concat(votes["Not Voting"]);
		return file;
	}

	import(directory: string) {
		fs.readdir(directory, null, (error, files) => {
			if (error) {
				console.warn(error);
				this.errors.push({
					path: directory,
					error
				} as IImportError)
				return;
			}

			for (let f in files) {
				const file = files[f];
				const path = directory + "/" + file;

				try {
					if (FileService.isFile(path)) {
						const file = this.fileToRecord(path);
						if (file) {
							this.processRecord(file);
						}
						
						continue;
					}

					this.folders.push(f);
					this.import(path);

				} catch (err) {
					console.warn(err);
					this.errors.push({
						path,
						error: err
					})
				}
			}
			this.status();
		})

		return this.errors;
	}

	private getOrCreateCategoryType = async (record: VoteImport) => {
		let incoming = await this.database.categoryType.findFirst({
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
	
	private getOrCreateChamber = async (record: VoteImport) => {
		let incoming = await this.database.chamber.findFirst({
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

	private getOrCreateCongressionalSession = async (record: VoteImport) => {
		let incoming = await this.database.congressionalSession.findFirst({
			where: {
				name: record.session
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.congressionalSession.create({
			data: {
				name: record.session,
				slug: Utilities.slugify(record.session),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}

	private getOrCreateRequiresType = async (record: VoteImport) => {
		let incoming = await this.database.requiresType.findFirst({
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
	private getOrCreateResultType = async (record: VoteImport) => {
		let incoming = await this.database.resultType.findFirst({
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
	private getOrCreateVoteType = async (record: VoteImport) => {
		let incoming = await this.database.voteType.findFirst({
			where: {
				name: record.type
			}
		})

		if (incoming) {
			return incoming;
		}

		return await this.database.voteType.create({
			data: {
				name: record.type,
				slug: Utilities.slugify(record.type),
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}

	private getOrCreateBallots = async (record: VoteImport) => {

	}
	
	processRecord = async (record: VoteImport) => {
		let vote = await this.database.vote.findFirst({
			where: {
				congressional_vote_id: record.vote_id
			}
		})

		if (vote) {
			return vote;
		}

		console.log('Creating category type: ', record.category)
		const categoryType = await this.getOrCreateCategoryType(record);
		console.log('Yielded ', categoryType.id);
	
		console.log('Creating chamber: ', record.chamber)
		const chamber = await this.getOrCreateChamber(record);
		console.log('Yielded ', chamber.id);
	
		console.log('Creating congressional session: ', record.session)
		const congressionalSession = await this.getOrCreateCongressionalSession(record);
		console.log('Yielded ', congressionalSession.id);
	
		console.log('Creating requires type: ', record.requires)
		const requiresType = await this.getOrCreateRequiresType(record);
		console.log('Yielded ', requiresType.id);

		console.log('Creating result type: ', record.result)
		const resultType = await this.getOrCreateResultType(record);
		console.log('Yielded ', resultType.id);

		console.log('Creating vote type: ', record.type)
		const voteType = await this.getOrCreateVoteType(record);
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

		const ballots = this.getOrCreateBallots(record);
	}

	private clearConsole() {
		process.stdout.write(
			'\x1B[H\x1B[2J'
		);
	}

	status() {
		this.clearConsole();
		console.log(`${this.files.length} files read\t\t${this.folders.length} folders read.`);
	}




}