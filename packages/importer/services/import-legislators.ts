import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { StateService } from "@my-fat-senator/lib/models/state";
import { PrismaClient } from '@prisma/client';
import { Legislator } from '@prisma/client';

export enum IAction {
	SKIP = "s",
	UPDATE = "u",
	CONFIRM = "",
	RETRY = "r"
};

export interface IConfirmOptions {
	message: string;
	actions: IAction[];
}

async function getInput(message: string) {
	const rl = readline.createInterface({ input, output });
	const response = await rl.question(`${message}${skipLine(1)}`);
	rl.close();
	return response.toLowerCase().trim();
}

async function getAction(prompt: string): Promise<IAction> {
	const response = await getInput(prompt);

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
		default:
			console.log("Unrecognized command. Please try again.")
			action = await getAction(prompt);
	}

	return action;
}

async function confirm(): Promise<boolean> {
	const response = await getAction(`Confirm (enter) or retry (r)`);
	if (response == IAction.CONFIRM) {
		return true;
	}
	if (response == IAction.RETRY) {
		console.log("TODO: Retry.");
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
	let value = await getInput(`Provide the new ${field}:`);
	console.log(`New ${field}: ${value}`)

	const confirmation = await confirm();
	if (!confirmation) {
		value = await getNewValue(field);
	}
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

		// fetch legislators
		console.log("Getting legislators without bioguides.");
		const legislators = await legislatorService.getLegislatorsWithoutBioguideId();
		console.log(`Found ${legislators.length}.`);

		for (const legislator of legislators) {
			const bioguideid = await getBioguideId(legislator);

			if (bioguideid.toLowerCase().trim() != legislator.bioguideid.toLowerCase().trim()) {
				legislatorService.updateBioguideId(legislator.id, bioguideid);
				continue;
			}
			console.log("Bioguide id was unchanged. Continuing.");
		}
}