import { Legislator, PrismaClient } from '@prisma/client';

import { IBallot } from '../interfaces';

import { PartyService } from './party';
import { StateService } from './state';


export class LegislatorService {
	constructor(private database: PrismaClient,
							private partyService: PartyService,
							private stateService: StateService
	) {
	}

	// TODO: This is the function where I'm starting to think that 
	// the norm with prisma may be to call it directly wherever you need it?
	// May need to rethink structure/use of services
	public updateBioguideId = async (legislatorId: number, bioguideid: string): Promise<Legislator> => {
		return await this.database.legislator.update({
			where: {
				id: legislatorId
			},
			data: {
				bioguideid: bioguideid.trim()
			}

		});
	}

	public getLegislatorsWithoutBioguideId = async (): Promise<Legislator[]> => {
		const legislators = await this.database.legislator.findMany({
			where: {
				bioguideid: undefined 
			}
		})
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