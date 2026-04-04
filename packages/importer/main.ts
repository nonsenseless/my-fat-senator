import 'dotenv/config';
import { CommandLineService, CongressionalAPIService, ErrorLoggerService } from '@my-fat-senator/lib';
import { LegislatorDepictionService } from '@my-fat-senator/lib/models/legislator-depiction';
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { StateService } from "@my-fat-senator/lib/models/state";
import { PrismaClient } from '@prisma/client';
import minimist from 'minimist';

import { importVotes } from './services/import-votes';
import { LegislatorImportService } from './services/legislator-import.service';

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

async function legislatorImport() {
	const stateService = new StateService(prisma);
	const partyService = new PartyService(prisma);
	const logger = new ErrorLoggerService();
	const legislatorService = new LegislatorService(prisma, partyService, stateService, logger);
	const depictionService = new LegislatorDepictionService(prisma);
	const cli = new CommandLineService();
	const congressionalAPI = new CongressionalAPIService();

	const importService = new LegislatorImportService(
		prisma, legislatorService, depictionService, cli, congressionalAPI, logger
	);
	return await importService.importLegislators(118);
}

switch (args["command"]) {
	case "votes":
		importVotes(prisma, config["TargetDirectory"]);
		break;
	case "legislators": {
		legislatorImport().catch(console.error);
		break;
	}
	default:
		console.error("Unrecognized command.");
		break;
}


