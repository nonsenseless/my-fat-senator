import { Legislator, Party, State } from "@prisma/client";

export interface LegislatorViewModel extends Legislator {
	party: Party;
	state: State;
}