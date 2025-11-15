import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import minimist from 'minimist';

import { importVotes } from './services/import-votes';
import { importLegislators } from './services/import-legislators';


const args = minimist(process.argv.slice(2));
console.log("Starting importer");
console.log("Import: ", args["import"]);
console.log("Source: ", args["source"]);

const config = {
	TargetDirectory: args["source"] || "/Users/nym/code/congress/data"	
}

const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error']
});
prisma.$connect();

switch (args["command"]) {
	case "votes":
		importVotes(prisma, config["TargetDirectory"]);
		break;
	case "legislators":
		importLegislators(prisma);
		break;
	default:
		console.error("Unrecognized command.");
		break;
}


