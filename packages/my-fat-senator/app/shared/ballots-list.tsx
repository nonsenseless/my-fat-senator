import React from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

interface BallotsListProps {
	ballotChoiceType: string
	ballots: BallotViewModel[]
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	return (<div className="ballots-list">
		<h3>{props.ballotChoiceType} ({props.ballots.length})</h3>
		<ul>
			{props.ballots
				.map((ballot, index) => (
					<li className={ballot.legislator.party.slug + '-party-list-item list-none'} key={index}>{ballot.legislator.displayName}</li>
				))
			}
		</ul>
	</div>)
}