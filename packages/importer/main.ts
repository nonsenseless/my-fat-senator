
import { Importer } from "lib";

console.log("Starting importer");

const config = {
	TargetDirectory: "/Users/nym/code/congress/data/118"
}

const importer = new Importer();
importer.readFiles(config.TargetDirectory);