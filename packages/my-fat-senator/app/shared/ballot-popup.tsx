import { BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React from 'react';
import tinyinvariant from 'tiny-invariant';


interface BallotPopupProps {
	ballot: BallotViewModel
}
export const BallotPopup: React.FC<BallotPopupProps> = (props) => {
	tinyinvariant(props.ballot, "Ballot is required");
	const ballot = props.ballot;

	return (<div>
		<div className="card w-96 bg-base-100 shadow-xl ballot-popup">
			<div className="card-body">
				<h2 className="card-title">{ballot.legislator.displayName}</h2>
			</div>
		</div>
		</div>) 
}