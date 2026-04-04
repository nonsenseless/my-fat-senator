import { CongressionalAPIService, CommandLineService, IAction, ErrorLoggerService } from '@my-fat-senator/lib';
import { LegislatorDepictionService } from '@my-fat-senator/lib/models/legislator-depiction';
import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { ICongressMember } from '@my-fat-senator/lib/interfaces';
import { Legislator, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export class LegislatorImportService {
	constructor(
		private database: PrismaClient,
		private legislatorService: LegislatorService,
		private depictionService: LegislatorDepictionService,
		private cli: CommandLineService,
		private congressionalAPI: CongressionalAPIService,
		private logger: ErrorLoggerService
	) { }

	/**
	 * Asks the user for a bioguide id
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
	 * Retrieves the members of congress for a given term, saves the raw data, and
	 * attempts to create a LegislatorDepiction for any legislator already in the DB.
	 * Both writes are wrapped in a single transaction so a failed depiction upsert
	 * rolls back the raw-record insert (and vice versa).
	 */
	public importLegislators = async (congressNumber: number) => {
		const legislators = await this.congressionalAPI.getMembersOfCongress({ congressNumber });
		if (!legislators || legislators.length === 0) {
			console.log("No legislators found for term. Maybe you screwed up?");
			return;
		}

		for (const legislator of legislators) {
			try {
				await this.database.$transaction(async (tx) => {
					// Save raw API record (equivalent to legislatorService.importLegislator)
					const existing = await tx.congressionalLegislatorRecord.findFirst({
						where: { bioguideid: legislator.bioguideId }
					});
					if (existing) {
						console.log(`CongressionalLegislatorRecord already exists for bioguideId: ${legislator.bioguideId}`);
					} else {
						await tx.congressionalLegislatorRecord.create({
							data: {
								bioguideid: legislator.bioguideId || null,
								rawData: JSON.stringify(legislator),
								processed: false,
								processingErrorMessage: ''
							}
						});
						console.log(`Created CongressionalLegislatorRecord for bioguideId: ${legislator.bioguideId}`);
					}

					// Upsert depiction if the Legislator row already exists (equivalent to importDepiction)
					if (!legislator.depiction) {
						console.log(`No depiction data for bioguideId: ${legislator.bioguideId} — skipping.`);
						return;
					}
					const leg = await tx.legislator.findUnique({
						where: { bioguideid: legislator.bioguideId }
					});
					if (!leg) {
						console.warn(`No Legislator record found for bioguideId ${legislator.bioguideId} — skipping depiction.`);
						return;
					}
					await tx.legislatorDepiction.upsert({
						where: { legislatorId: leg.id },
						update: {
							imageUrl: legislator.depiction.imageUrl,
							attributionUrl: legislator.depiction.attribution ?? null
						},
						create: {
							legislatorId: leg.id,
							imageUrl: legislator.depiction.imageUrl,
							attributionUrl: legislator.depiction.attribution ?? null
						}
					});
				});
			} catch (err: unknown) {
				console.log(err);
			}
		}
	}

	/**
	 * Creates or updates the LegislatorDepiction for a given member payload.
	 * Safe to call even when the corresponding Legislator row doesn't exist yet —
	 * it will log a warning and return null rather than throwing.
	 */
	public importDepiction = async (member: ICongressMember): Promise<void> => {
		if (!member.depiction) {
			console.log(`No depiction data for bioguideId: ${member.bioguideId} — skipping.`);
			return;
		}

		await this.depictionService.upsertForBioguideId(
			member.bioguideId,
			member.depiction.imageUrl,
			member.depiction.attribution
		);
	}

	/**
	 * Iterates over all unprocessed CongressionalLegislatorRecords and creates
	 * LegislatorDepictions for any that have a matching Legislator row.
	 */
	public processCongressionalLegislatorRecords = async () => {
		const records = await this.database.congressionalLegislatorRecord.findMany({
			where: { processed: false }
		});

		for (const record of records) {
			if (record.bioguideid == null) {
				this.logger.logError({}, `No bioguideid for congressional legislator record: ${record.id}`);
				continue;
			}

			await this.processCongressionalLegislatorRecord(record.bioguideid);
		}
	}

	/**
	 * Processes a single CongressionalLegislatorRecord by creating its LegislatorDepiction.
	 * Does not mark the record as fully processed — depiction import is one step of a larger
	 * pipeline; the processed flag should only be set once the full Legislator schema has been
	 * populated. On error, records the error message on the raw record.
	 */
	public processCongressionalLegislatorRecord = async (bioguideid: string) => {
		const records = await this.database.congressionalLegislatorRecord.findMany({
			where: { bioguideid }
		});

		if (records.length === 0) {
			console.warn(`No import record found for bioguideid ${bioguideid}`);
			return;
		}

		if (records.length > 1) {
			console.warn(`Multiple import records found for bioguideid ${bioguideid}`);
			return;
		}

		const record = records[0];

		try {
			const member: ICongressMember = JSON.parse(record.rawData);
			await this.importDepiction(member);
		} catch (error) {
			const json = JSON.stringify(error);
			this.logger.logError(json, error);
			await this.database.congressionalLegislatorRecord.update({
				where: { id: record.id },
				data: { processingErrorMessage: json }
			});
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
					where: { id: legislator.id },
					data: { unprocessable: true }
				});
				console.log("Updated.");
			}
		}
	}
}
