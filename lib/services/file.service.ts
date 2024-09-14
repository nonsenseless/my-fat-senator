import fs from 'fs';

export enum FileTypes {
	JSON = "json",
	XML = "xml"
}


export class FileService {
	public static isFile = (fileName: string) => {
		return fs.lstatSync(fileName).isFile();
	}
	
	private static tryGetExtension = (path: string) => {
		if (path.indexOf(".") === -1) {
			console.log("No extension found for ", path);
			return;
		}
		const parts = path.split(".");
		// We don't definitively know this is an extension yet but there's at least one "." or the function would have returned.
		const extension = parts?.pop()?.toLowerCase();
		return extension;
	}

	private static readFile = (path: string) => {
		let file = null;	
		try {

			file = fs.readFileSync(path, 'utf-8');
			
		} catch (error) {
				console.error(error);
				throw error;
		}
		return file;
	}

	public static tryGetJSON = (path: string) => {
		const file = this.readFile(path);
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
}