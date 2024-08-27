import fs from 'fs';

export enum FileTypes {
	JSON = "json",
	XML = "xml"
}

export class Importer {
	files: string[] = [];
	folders: string[] = [];

	constructor(){

	}
	readFiles(path: string) {
		fs.readdir(path, null, (error, files) => {
			this.clearConsole();
			if (error) {
				console.warn(error);
				return;
			}

			for (let file in files) {
				const f = files[file];
				const filePath = path + "/" + f;

				if (this.isFile(filePath)) {
					console.log("Found file ", f, "\n");
					this.files.push(f);
					
					const file = this.getFile(filePath);
					const extension = this.tryGetExtension(filePath);

					let record;
					switch (extension) {
						case FileTypes.JSON:
							record = JSON.parse(file);
							console.log(record);
							break;
						case FileTypes.XML:
							console.log("Oh an xml file, maybe we'll do something with this one day");
							break;
						default:
							console.log("Unknown extension: ", extension);
					}
					continue;
				}

				this.folders.push(f);
				this.readFiles(filePath);
			}
			this.status();
		})
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

	processFile(file: File){
		// try
			// import json as object
			// insert into database
			// attempt to upsert in new schema
			// save success record
		// catch
			// save error record
		// end

		// save errors to file

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