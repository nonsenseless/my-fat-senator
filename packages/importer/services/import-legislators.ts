import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { StateService } from "@my-fat-senator/lib/models/state";
import { PrismaClient } from '@prisma/client';
import { Legislator } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export enum IAction {
	SKIP = "s",
	UPDATE = "u",
	CONFIRM = "y",
	DENY = "n",
	RETRY = "r"
};

async function getInput(message: string) {
	const rl = readline.createInterface({ input, output });
	const response = await rl.question(`${message}${skipLine(1)}`);
	rl.close();
	return response.trim();
}

async function getAction(prompt: string): Promise<IAction> {
	const response = (await getInput(prompt)).toLowerCase();

	let action: IAction;
	switch (response) {
		case IAction.SKIP:
			action = IAction.SKIP;
			break;
		case IAction.UPDATE:
			action = IAction.UPDATE;
			break;
		case IAction.RETRY:
			action = IAction.RETRY;
			break;
		case IAction.CONFIRM:
			action = IAction.CONFIRM;
			break;
		case IAction.DENY:
			action = IAction.DENY;
			break;
		default:
			console.log("Unrecognized command. Please try again.")
			action = await getAction(prompt);
	}

	return action;
}

async function confirm(message: string): Promise<boolean> {
	const response = await getAction(message + "\n (Y)es or (N)o?");
	if (response == IAction.CONFIRM) {
		return true;
	}
	return false;
}
function skipLine(lines: number): string {
	let indentation = "\n";
	for (let i = 1; i < lines; i++) {
		indentation += "\n";
	}

	return indentation;
}

async function getNewValue(field: string) {
	const value = await getInput(`Provide the new ${field}:`);
	console.log(`New ${field}: ${value}`)

	return value;
}

// TODO: Move CLI logic into a distinct class; create command interface  on top of it
async function getBioguideId(legislator: Legislator) {
	let bioguideid = legislator.bioguideid;
	console.log(`Reviewing ${legislator.firstName} ${legislator.lastName}: BioguideId: ${bioguideid}`);
	const command = await getAction('(U)pdate or (S)kip?');

	if (command == IAction.UPDATE) {
		bioguideid = await getNewValue(`bioguideid`);	
	}
	return bioguideid;
}

export async function importLegislators(prisma: PrismaClient) {
		const stateService = new StateService(prisma);
		const partyService = new PartyService(prisma);
		const legislatorService = new LegislatorService(prisma, partyService, stateService);

		console.log("Getting legislators without bioguides.");
		const legislators = await legislatorService.getLegislatorsWithoutBioguideId();
		console.log(`Found ${legislators.length}.`);

		for (const legislator of legislators) {
			const bioguideid = await getBioguideId(legislator);

			try {
				if (bioguideid.toLowerCase().trim() != legislator.bioguideid.toLowerCase().trim()) {
					await legislatorService.updateBioguideId(legislator.id, bioguideid);
				}
			} catch (ex: unknown) {
				console.log("Error updating legislator " + legislator.displayName);
				if (typeof ex == "string") {
					console.log(ex);
				} else if (ex instanceof PrismaClientKnownRequestError) {
					console.log(`${ex.code} - ${ex.message}`);
				} else {
					console.log(ex);
				}

				const response = await confirm("Mark legislator as unprocessable?");
				if (response) {
					await legislatorService.update({
						where: {
							id: legislator.id
						},
						data: {
							unprocessable: true
						}
					})
					console.log("Updated.");
				}
			}
		}
}