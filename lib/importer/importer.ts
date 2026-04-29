import * as fs from 'node:fs';

import { BallotService } from "@my-fat-senator/lib/models/ballot";
import { BallotChoiceTypeService } from "@my-fat-senator/lib/models/ballot-choice-type";
import { CategoryTypeService } from "@my-fat-senator/lib/models/category-type";
import { ChamberService } from "@my-fat-senator/lib/models/chamber";
import { CongressionalSessionService } from "@my-fat-senator/lib/models/congressional-session";
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { RequiresTypeService } from "@my-fat-senator/lib/models/requires-type";
import { ResultTypeService } from "@my-fat-senator/lib/models/result-type";
import { StateService } from "@my-fat-senator/lib/models/state";
import { VoteService } from "@my-fat-senator/lib/models/vote";
import { VoteTypeService } from "@my-fat-senator/lib/models/vote-type";
import { PrismaClient } from '@prisma/client';

import { IImportError } from '../interfaces/import-error.interface';
import { ErrorLoggerService } from "../services";
import { FileService } from '../services/file';

export const buildImporter = (prisma: PrismaClient) : Importer => {
	const ballotChoiceTypeService = new BallotChoiceTypeService(prisma);
	const categoryTypeService = new CategoryTypeService(prisma);
	const chamberService = new ChamberService(prisma);
	const congressionalSessionService = new CongressionalSessionService(prisma);
	const requiresTypeService = new RequiresTypeService(prisma);
	const resultTypeService = new ResultTypeService(prisma);
	const voteTypeService = new VoteTypeService(prisma);
	const stateService = new StateService(prisma);
	const partyService = new PartyService(prisma);
	const logger = new ErrorLoggerService();
	const legislatorService = new LegislatorService(prisma, partyService, stateService, logger);
	const ballotService = new BallotService(prisma, ballotChoiceTypeService, legislatorService);

	const voteService = new VoteService(
		prisma,
		ballotService, categoryTypeService, chamberService, congressionalSessionService,
		requiresTypeService, resultTypeService, voteTypeService);

	const importer = new Importer(voteService);

	return importer;
}

export class Importer {
	files: string[] = [];
	folders: string[] = [];
	errors: IImportError[] = []

	constructor(
		private voteService: VoteService
	){
	}

	// TODO: Logger
	private logError(path: string, error: unknown) {
		this.errors.push({
			path,
			error
		} as IImportError)
	}

	private readDir(path: string) : Promise<string[]>{
		return new Promise((resolve, reject) => {
			fs.readdir(path, null, async(error, files: string[]) => {
				if (error) {
					this.logError(path, error);
					return reject(error);
				}

				return resolve(files);
			})
		})
	}

	async import(directory: string) {
		const files = await this.readDir(directory);

		for (const f in files) {
			const file = files[f];
			const path = directory + "/" + file;

			try {
				if (FileService.isFile(path)) {
					this.files.push(f);
					await this.voteService.importVote(path);	
					continue;
				}

				this.folders.push(f);
				const importErrors = await this.import(path);
				this.errors = this.errors.concat(importErrors);

			} catch (error) {
				this.logError(path, error);
				return Promise.reject(error);
			}
		}
		this.status();

		console.log("Encountered ", this.errors.length, " errors:");
    console.log(this.errors.map((error) => error.path).join("\n"));
		return this.errors;
	}

	// TODO: Console utility?
	private clearConsole() {
		process.stdout.write(
			'\x1B[H\x1B[2J'
		);
	}

	status() {
		console.log(`${this.files.length} files read\t\t${this.folders.length} folders read. ${this.errors.length} errors.`);
	}

}