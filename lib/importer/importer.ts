import { PrismaClient } from '@prisma/client';
import fs from 'fs';

export enum FileTypes {
	JSON = "json",
	XML = "xml"
}

export class Importer {
	files: string[] = [];
	folders: string[] = [];

	constructor(database: PrismaClient){
	}

	readFiles(path: string) {
		fs.readdir(path, null, (error, files) => {
			this.clearConsole();
			if (error) {
				console.warn(error);
				return;
			}

			for (let f in files) {
				const file = files[f];
				const filePath = path + "/" + file;

				if (this.isFile(filePath)) {
					const file = this.tryGetRecord(filePath);
					if (file) {
						this.processRecord(file);
					}
					
					continue;
				}

				this.folders.push(f);
				this.readFiles(filePath);
			}
			this.status();
		})
	}

	tryGetRecord(path: string) {
		const file = this.getFile(path);
		const extension = this.tryGetExtension(path);
		if (!extension) {
			return;
		}

		let record;
		switch (extension) {
			case FileTypes.JSON:
				record = JSON.parse(file);
				return record;
			case FileTypes.XML:
				console.log("Oh an xml file, maybe we'll do something with this one day");
				return;
			default:
				console.log("Unknown extension: ", extension);
				return;
		}
	}

	status() {
		console.log(`${this.files.length} files read\t\t${this.folders.length} folders read.`);
	}

	tryGetExtension(path: string) {
		if (path.indexOf(".") === -1) {
			console.log("No extension found for ", path);
			return;
		}
		const parts = path.split(".");
		// We don't definitively know this is an extension yet but there's at least one "." or the function would have returned.
		const extension = parts?.pop()?.toLowerCase();
		return extension;
	}

	getFile<T>(path: string) {
		let file = null;	
		try {

			file = fs.readFileSync(path, 'utf-8');
			
		} catch (error) {
				console.error(error);
				return "{}";
		}
		return file;
	}

	processRecord(record: any){

	}
	private clearConsole() {
		process.stdout.write(
			'\x1B[H\x1B[2J'
		);
	}

	private isFile = (fileName: string) => {
		return fs.lstatSync(fileName).isFile();
	};

}