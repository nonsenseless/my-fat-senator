import { CommandLineService, IAction } from '@my-fat-senator/lib';
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { StateService } from "@my-fat-senator/lib/models/state";
import { PrismaClient, Legislator } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

async function getBioguideId(legislator: Legislator) {
	const cli = new CommandLineService();

	let bioguideid = legislator.bioguideid;
	console.log(`Reviewing ${legislator.firstName} ${legislator.lastName}: BioguideId: ${bioguideid}`);
	const command = await cli.getAction('(U)pdate or (S)kip?');

	if (command == IAction.UPDATE) {
		bioguideid = await cli.getNewValue(`bioguideid`);	
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