import React from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

import { BallotsListItem } from './ballots-list-item';


interface BallotsListProps {
	ballotChoiceType: string
	showAsList: boolean;
	ballots: BallotViewModel[]
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	return (<div className="ballots-list w-1/4">
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