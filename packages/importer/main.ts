import 'dotenv/config';
import { buildImporter } from '@my-fat-senator/lib';
import { PrismaClient } from '@prisma/client';
import minimist from 'minimist';

import { buildLegislatorImportService } from './services/legislator-import.service';

const args = minimist(process.argv.slice(2));
console.log("Starting importer");
console.log("Args: ", args);

const config = {
	TargetDirectory: args["source"] || "/Users/nym/code/congress/data"	
}

const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error']
});
prisma.$connect();


switch (args["command"]) {
	case "votes":
		buildImporter(prisma).import(config["TargetDirectory"]);
		break;
	case "legislators":
		buildLegislatorImportService(prisma).importLegislators(118).catch(console.error);
		break;
	case "process-depictions":
		buildLegislatorImportService(prisma).processCongressionalLegislatorRecords().catch(console.error);
		break;
	default:
		console.error("Unrecognized command.");
		break;
}


