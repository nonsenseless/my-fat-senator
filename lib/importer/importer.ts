import fs from 'fs';

export class Importer {
	files: string[] = [];
	folders: string[] = [];

	constructor(){

	}
	private clearConsole() {
		process.stdout.write(
			'\x1B[H\x1B[2J'
		);
	}

	isFile = (fileName: string) => {
		return fs.lstatSync(fileName).isFile();
	};

	readFiles(path: string) {
		fs.readdir(path, null, (error, files) => {
			this.clearConsole();
			if (error) {
				console.warn(error);
				return;
			}

			for (let file in files) {
				const f = files[file];

				if (this.isFile(path + "/" + f)) {
					console.log("Found file ", f, "\n");
					this.files.push(f);

					continue;
				}

				this.folders.push(f);
				this.readFiles(path + '/' + f);
			}
			this.status();
		})
	}

	status() {
		console.log(`${this.files.length} files read\t\t${this.folders.length} folders read.`);
		if (this.files.length == 0 && this.folders.length == 0) {
			return;
		}
		this.files.forEach((name) => {
			console.log(name);
		})

		this.folders.forEach((name) => {
			console.log(name);
		})
	}

	getFile<T>(path: string) {
		fs.readFile(path, (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
		})
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
}