import { LegislatorService } from "@my-fat-senator/lib/models/legislator";
import { PartyService } from "@my-fat-senator/lib/models/party";
import { StateService } from "@my-fat-senator/lib/models/state";
import { PrismaClient } from '@prisma/client';

export function importLegislators(prisma: PrismaClient) {
		const stateService = new StateService(prisma);
		const partyService = new PartyService(prisma);
		const legislatorService = new LegislatorService(prisma, partyService, stateService);

}