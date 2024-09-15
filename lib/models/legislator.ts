import { Legislator, PrismaClient } from '@prisma/client';

import { IBallot } from '../interfaces/congress/vote';

import { PartyService } from './party';
import { StateService } from './state';


export class LegislatorService {
	constructor(private database: PrismaClient,
							private partyService: PartyService,
							private stateService: StateService
	) {
	}

	getOrCreateLegislator = async (record: IBallot): Promise<Legislator> => {
		console.log('Creating legislator: ', record.id);
		const incoming = await this.database.legislator.findFirst({
			where: {
				bioguideid: record.id
			}
		})

		if (incoming) {
			return incoming;
		}

		const state = await this.stateService.getOrCreateState(record);
		const party = await this.partyService.getOrCreateParty(record);

		return await this.database.legislator.create({
			data: {
				bioguideid: record.id,
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