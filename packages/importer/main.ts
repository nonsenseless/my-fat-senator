import 'dotenv/config';

import { Importer } from "@my-fat-senator/lib";
import { BallotService } from "@my-fat-senator/lib/models/ballot";
import { BallotChoiceTypeService } from "@my-fat-senator/lib/models/ballot-choice-type";
import { CategoryTypeService } from "@my-fat-senator/lib/models/category-type";
import { ChamberService } from "@my-fat-senator/lib/models/chamber";
import { CongressionalSessionService } from "@my-fat-senator/lib/models/congressional-session";
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { RequiresTypeService } from "@my-fat-senator/lib/models/requires-type";
import { ResultTypeService } from "@my-fat-senator/lib/models/result-type";
import { StateService } from "@my-fat-senator/lib/models/state";
import { VoteService } from "@my-fat-senator/lib/models/vote";
import { VoteTypeService } from "@my-fat-senator/lib/models/vote-type";
import { PrismaClient } from '@prisma/client';

const args = process.argv;
console.log("Starting importer");
console.log("Exec path: ", args[0]);
console.log("Script: ", args[1]);
console.log("Target: ", args[2]);

const config = {
	TargetDirectory: args[2] || "../../data"
	
}
const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error']
});
prisma.$connect();

const ballotChoiceTypeService = new BallotChoiceTypeService(prisma);
const stateService = new StateService(prisma);
const partyService = new PartyService(prisma);
const legislatorService = new LegislatorService(prisma, partyService, stateService);
const ballotService = new BallotService(prisma, ballotChoiceTypeService, legislatorService);
const categoryTypeService = new CategoryTypeService(prisma);
const chamberService = new ChamberService(prisma);
const congressionalSessionService = new CongressionalSessionService(prisma);
const requiresTypeService = new RequiresTypeService(prisma);
const resultTypeService = new ResultTypeService(prisma);
const voteTypeService = new VoteTypeService(prisma);

// wE ShOuLd SeT uP DePeNdEnCy InJeCtIoN
const voteService = new VoteService(
	prisma, 
	ballotService, categoryTypeService, chamberService, congressionalSessionService, 
	requiresTypeService, resultTypeService, voteTypeService);
const importer = new Importer(voteService);

importer.import(config.TargetDirectory).then((errors)=> {
	console.log("Encountered ", errors.length, " errors:")
	console.log(errors.map((error) => error.path).join("\n"));
});