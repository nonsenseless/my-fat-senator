import { Legislator, LegislatorDepiction, Party, State } from "@prisma/client";

export interface LegislatorViewModel extends Legislator {
	party: Party;
	state: State;
	depiction?: LegislatorDepiction | null;
}