import { BallotChoiceType } from "@prisma/client";

import { InteractiveElement } from "./interactive-element.interface";
import { LegislatorViewModel } from "./legislator.interface";

export interface BallotViewModel extends InteractiveElement {
	y: number;
	x: number;
	radius: number;
	scaledRadius: number; // Radius scaled based on population
	population: number; // Population represented by this ballot
	ballotChoiceType: BallotChoiceType
	legislator: LegislatorViewModel;
}