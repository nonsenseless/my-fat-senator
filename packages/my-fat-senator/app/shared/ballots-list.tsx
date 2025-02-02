import React from 'react';

import { BallotViewModel } from '~/routes/votes.$id';

import { CardBorder } from './layout/card';

interface BallotsListProps {
	ballotChoiceType: string
	ballots: BallotViewModel[]
}

export const BallotsList: React.FC<BallotsListProps> = (props) => {
	return (<div className="ballots-list w-1/4">
		<h3>{props.ballotChoiceType} ({props.ballots.length})</h3>
		<ul>
			{props.ballots
				.map((ballot, index) => (
					<div key={index} className={`${CardBorder.Two} pr-4 mb-1 w-100 flex flex-row items-center`}>

							<div className="bg-neutral text-neutral-content w-1/3">
								<img alt="Stock Avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
							</div>

							<div className='pl-2 w-full'>
								<span className="text-xl"> {ballot.legislator.displayName}</span>
								<div className="flex justify-between">
									<span>{ballot.legislator.state.name}</span>
									<span>{ballot.legislator.party.name}</span>
								</div>
							</div>
					</div>
				))
			}
		</ul>
	</div>)
}