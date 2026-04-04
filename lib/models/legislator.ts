import { Legislator, PrismaClient, Prisma } from '@prisma/client';

import { IBallot, ICongressMember } from '../interfaces';
import { ErrorLoggerService } from '../services/logger';

import { PartyService } from './party';
import { StateService } from './state';


export class LegislatorService {
	constructor(private database: PrismaClient,
							private partyService: PartyService,
							private stateService: StateService,
							private logger: ErrorLoggerService
	) {
	}

	public async findMany(getArgs: Prisma.LegislatorFindManyArgs) {
		const legislators = await this.database.legislator.findMany(getArgs);
		return legislators;
	}

	public async importLegislator(rawData: ICongressMember) {
		try {
			const existing = await this.database.congressionalLegislatorRecord.findFirst({
				where: {
					bioguideid: rawData.bioguideId
				}
			});

			if (existing) {
				console.log(`CongressionalLegislatorRecord already exists for bioguideId: ${rawData.bioguideId}`);
				return;
			}

			await this.database.congressionalLegislatorRecord.create({
				data: {
					bioguideid: rawData.bioguideId || null,
					rawData: JSON.stringify(rawData),
					processed: false,
					processingErrorMessage: ''
				}
			});

			console.log(`Created CongressionalLegislatorRecord for bioguideId: ${rawData.bioguideId}`);

		} catch (error) {
			await this.logger.logError(rawData, error, {
				identifier: rawData.bioguideId || 'unknown'
			});
		}
	}	

	// So technically we're wrapping calls but we still leak out the prisma signature.
	// I guess at least it's a chokepoint?
	public async update(updateArgs: Prisma.LegislatorUpdateArgs) {
		const legislator = this.database.legislator.update(updateArgs)

		return legislator;
	}

	public updateBioguideId = async (legislatorId: number, bioguideid: string): Promise<Legislator> => {
		console.log(legislatorId);
		console.log(bioguideid);

		return await this.update({
			where: {
				id: legislatorId
			},
			data: {
				bioguideid: bioguideid.trim()
			}
		})
	}

	public getLegislatorsWithoutBioguideId = async (): Promise<Legislator[]> => {
		const legislators = await this.database.$queryRaw<Legislator[]> `
			SELECT * 
			FROM Legislator 
			WHERE LENGTH(bioguideid) < 5 AND unprocessable = 0
		`;
		return legislators;
	};

	getOrCreateLegislator = async (record: IBallot): Promise<Legislator> => {
		console.log('Creating legislator: ', record.id);

		// This now works only for senators; would need to tweak higher up the call stack to switch for house members
		const incoming = await this.database.legislator.findFirst({
			where: {
				lis_member_id: record.id
			}
		})

		if (incoming) {
			return incoming;
		}

		const state = await this.stateService.getOrCreateState(record);
		const party = await this.partyService.getOrCreateParty(record);

		return await this.database.legislator.upsert({
			where: {
				lis_member_id: record.id,
			},
			update: {},
			create: {
				bioguideid: record.id, // This is dumb but it at least sets an initial value for senators until we can go and *manually* get the real bioguide id.
				lis_member_id: record.id,
				displayName: record.display_name,
				firstName: record.first_name,
				lastName: record.last_name,
				partyId: party.id,
				stateId: state.id,
				reviewed: false // TODO I suppose this should have a default
			}
		})
	}
}