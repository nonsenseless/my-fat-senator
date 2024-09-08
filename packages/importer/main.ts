
import { Importer } from "lib";
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

const importer = new Importer(prisma);
importer.import(config.TargetDirectory);