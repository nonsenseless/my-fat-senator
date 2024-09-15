import fs from 'fs';

import { IImportError } from '../interfaces/import-error.interface';
import { VoteService } from '../models/vote';
import { FileService } from '../services/file.service';

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
		console.warn(error);
		this.errors.push({
			path,
			error
		} as IImportError)
	}

	private readDir(path: string) : Promise<string[]>{
		return new Promise((resolve, reject) => {
			fs.readdir(path, null, async (error, files: string[]) => {
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

		return this.errors;
	}

	// TODO: Console utility?
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