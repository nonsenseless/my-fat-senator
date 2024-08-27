
import { Importer } from "lib";

const args = process.argv;
console.log("Starting importer");
console.log("Exec path: ", args[0]);
console.log("Script: ", args[1]);
console.log("Target: ", args[2]);

const config = {
	TargetDirectory: args[2] || "../../data"
	
}

const importer = new Importer();
importer.readFiles(config.TargetDirectory);