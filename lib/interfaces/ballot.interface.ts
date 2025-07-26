import { BallotChoiceType } from "@prisma/client";

import { InteractiveElement } from "./interactive-element.interface";
import { LegislatorViewModel } from "./legislator.interface";

export interface BallotViewModel extends InteractiveElement {
	y: number;
	x: number;
	radius: number;
	ballotChoiceType: BallotChoiceType
	legislator: LegislatorViewModel;
}