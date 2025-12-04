import { CongressionalAPIService, CommandLineService, IAction } from '@my-fat-senator/lib';
import { ICongressMember } from '@my-fat-senator/lib/interfaces';
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { Legislator } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class LegislatorImportService {
	constructor(
		private legislatorService: LegislatorService,
		private cli: CommandLineService,
		private congressionalAPI: CongressionalAPIService) { }

	/**
	 * Asks the user for a bioguide id
	 * @param legislator 
	 * @returns
	 */
	public getBioguideId = async (legislator: Legislator) => {
		let bioguideid = legislator.bioguideid;
		console.log(`Reviewing ${legislator.firstName} ${legislator.lastName}: BioguideId: ${bioguideid}`);
		const command = await this.cli.getAction('(U)pdate or (S)kip?');

		if (command == IAction.UPDATE) {
			bioguideid = await this.cli.getNewValue(`bioguideid`);
		}
		return bioguideid;
	}

	/**
	 * Retrieves the members of congress for a given term and saves the raw data
	 * @param congressNumber e.g. 118th congress --> 118
	 */
	public importLegislators = async(congressNumber: number) => {
		const legislators = await this.congressionalAPI.getMembersOfCongress({ congressNumber });
		if (!legislators || legislators.length === 0) {
			console.log("No legislators found for term. Maybe you screwed up?");
			return;
		}

		// Process legislators sequentially to properly handle async operations
		for (const legislator of legislators) {
			try {
				await this.legislatorService.importLegislator(legislator);
			} catch (err: unknown) {
				console.log(err);
			}
		}
	}

	/**
	 * Iterates over senators without appropriate bioguideid and asks for new value from user.
	 */
	updateBioguideIds = async () => {
		console.log("Getting legislators without bioguides.");
		const legislators = await this.legislatorService.getLegislatorsWithoutBioguideId();
		console.log(`Found ${legislators.length}.`);

		for (const legislator of legislators) {
			this.updateBioguideId(legislator);
		}
	}

	/**
	 * Asks for and updates the bioguideid for a legislator. 
	 * @param legislator 
	 */
	private updateBioguideId = async (legislator: Legislator) => {
		const bioguideid = await this.getBioguideId(legislator);

		try {
			if (bioguideid.toLowerCase().trim() != legislator.bioguideid.toLowerCase().trim()) {
				await this.legislatorService.updateBioguideId(legislator.id, bioguideid);
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
				await this.legislatorService.update({
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