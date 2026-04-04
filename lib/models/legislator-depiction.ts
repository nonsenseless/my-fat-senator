import { LegislatorDepiction, PrismaClient } from '@prisma/client';

export class LegislatorDepictionService {
	constructor(private database: PrismaClient) {}

	/**
	 * Creates or updates a LegislatorDepiction for the legislator identified by the given bioguideId.
	 * Returns null if no matching Legislator record exists yet (e.g. vote import hasn't run yet).
	 */
	public async upsertForBioguideId(
		bioguideId: string,
		imageUrl: string,
		attribution?: string | null
	): Promise<LegislatorDepiction | null> {
		const legislator = await this.database.legislator.findUnique({
			where: { bioguideid: bioguideId }
		});

		if (!legislator) {
			console.warn(`No Legislator record found for bioguideId ${bioguideId} — skipping depiction.`);
			return null;
		}

		return this.database.legislatorDepiction.upsert({
			where: { legislatorId: legislator.id },
			update: { imageUrl, attributionUrl: attribution ?? null },
			create: { legislatorId: legislator.id, imageUrl, attributionUrl: attribution ?? null }
		});
	}
}
