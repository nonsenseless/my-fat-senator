import 'dotenv/config';

import { Importer } from "@my-fat-senator/lib";
import { VoteService } from "@my-fat-senator/lib/models/vote";
import { PrismaClient } from '@prisma/client';

const args = process.argv;
console.log("Starting importer");
console.log("Exec path: ", args[0]);
console.log("Script: ", args[1]);
console.log("Target: ", args[2]);

const config = {
	TargetDirectory: args[2] || "/Users/nym/code/congress/data"
	
}
const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error']
});
prisma.$connect();

const voteService = new VoteService(prisma);
const importer = new Importer(voteService);

importer.import(config.TargetDirectory).then((errors)=> {
	console.log("Encountered ", errors.length, " errors:")
	console.log(errors.map((error) => error.path).join("\n"));
});