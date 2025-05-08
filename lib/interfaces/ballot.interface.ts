import { BallotChoiceType } from "@prisma/client";

import { InteractiveCircle } from "./interactive-circle.interface";
import { LegislatorViewModel } from "./legislator.interface";

export interface BallotViewModel extends InteractiveCircle {
	y: number;
	x: number;
	yVelocity: number;
	xVelocity: number;
	radius: number;
	ballotChoiceType: BallotChoiceType
	legislator: LegislatorViewModel;
}