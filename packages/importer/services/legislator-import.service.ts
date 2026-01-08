import { CongressionalAPIService, CommandLineService, IAction, prisma, ErrorLoggerService } from '@my-fat-senator/lib';
import { IMemberImport } from '@my-fat-senator/lib/interfaces';
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { Legislator, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export class LegislatorImportService {
	constructor(
		private legislatorService: LegislatorService,
		private cli: CommandLineService,
		private congressionalAPI: CongressionalAPIService,
		private logger: ErrorLoggerService) { }

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
	 * This function attempts to process all unprocessed congressional legislator records.
	 *  */
	public processCongressionalLegislatorRecords = async() => {
		const records = await prisma.congressionalLegislatorRecord.findMany({
			where: {
				processed: false
			} 
		});

		for (const record of records) {
			if (record.bioguideid == null) {
				this.logger.logError({}, `No bioguideid for congressional legislator record: ${record.id}`)
				continue;
			}

			await this.processCongressionalLegislatorRecord(record.bioguideid);
		}
	}

	/**
	 * Processes a CongressionalLegislatorRecord and converts it into the Legislator schema
	 */
	public processCongressionalLegislatorRecord = async(bioguideid: string) => {
		const records = await prisma.congressionalLegislatorRecord.findMany({
			where: {
				bioguideid: bioguideid
			}
		})

		if (records.length == 0) {
			console.warn(`No import record found for bioguideid ${bioguideid}`);
			return;
		}

		if (records.length > 0) {
			console.warn(`Multiple import records found for bioguideid ${bioguideid}`);
			return;
		}

		const record = records[0];
		const update = {
			where: {
				id: record.id 
			}, 
			data: {
				processed: true
			}
		} as Prisma.CongressionalLegislatorRecordUpdateArgs;

		try {
			const member: IMemberImport = JSON.parse(record.rawData);

			const legislator = await prisma.legislator.findUnique({
				where: {
					bioguideid: member.bioguideId
				}
			})
			
			// TODO In practice, we're only calling this after we've already imported a legislator
			// Future state would integrate with the existing find or create but I don't feel like scrutizining
			// minor differences in data formatting right now
			if (legislator == null) {
				console.error("Could not find a legislator ")
				return;
			}

			const depictions = await prisma.legislatorDepiction.findMany({
				where: {
					legislatorId: legislator.id
				}
			})

			if (depictions.length > 1) {
				console.error(`Multiple existing depictions found for`)
				return;
			}

			await prisma.legislatorDepiction.create({
				data: {
					legislatorId: legislator.id,
					attributionUrl: member.depiction.attributionUrl,
					imageUrl: member.depiction.imageUrl
				}
			})

		} catch (error) {
			const json = JSON.stringify(error);
			this.logger.logError(json, error);

			update.where.processingErrorMessage = json;
		}

		await prisma.congressionalLegislatorRecord.update(update)
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