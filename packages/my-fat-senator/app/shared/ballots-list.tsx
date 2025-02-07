import React from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

import { BallotsListItem } from './ballots-list-item';


interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

interface IToken {
	x1: number;
	x2: number;
	xVelocity: number;
	y1: number;
	y2: number;
	yVelocity: number;
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {

	const detectCollision = (a: IToken, b: IToken) => {
		if (a.x1 > b.x1 && a.x1 < b.x1) {
			console.log('Detected');
		}
	}

	const calculateAngleOfImpact = (a: IToken, b: IToken) => {
			console.log('calculated');

	}

	const convertMomentum = (a: IToken, b: IToken) => {
			console.log('converted');
	}

	return (<div className="ballots-list w-1/4 relative">
		<h3>{props.ballotChoiceType} ({props.ballots.length})</h3>
		<ul>
			{props.ballots
				.map((ballot, index) => (
					<BallotsListItem
						key={index} 
						showAsList={props.showAsList}
						legislator={ballot.legislator}></BallotsListItem> 
				))
			}
		</ul>
	</div>)
}