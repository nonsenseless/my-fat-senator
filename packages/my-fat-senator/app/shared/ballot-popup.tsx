import { BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React from 'react';
import tinyinvariant from 'tiny-invariant';


interface BallotPopupProps {
	ballot: BallotViewModel;
	viewportX: number;
	viewportY: number;
}
export const BallotPopup: React.FC<BallotPopupProps> = (props) => {
	tinyinvariant(props.ballot, "Ballot is required");
	const ballot = props.ballot;
	tinyinvariant(ballot.legislator, "Ballot legislator is required");
	const legislator = ballot.legislator;
	tinyinvariant(legislator.state, "Ballot legislator state is required");
	const state = legislator.state;

	return (<div style={{ position: 'fixed', left: props.viewportX + 'px', top: props.viewportY + 'px', zIndex: 50 }}>
		<div className="card card-side w-96 bg-base-100 shadow-xl ballot-popup">
			<figure className={'h-[100[px] w-[100px]'}>
				<img className={'h-full w-full'}
					src={legislator.depiction?.imageUrl ?? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
					alt={`Portrait of ${legislator.lastName}`} />
			</figure>
			<div className="card-body  pt-[10px] pb-[10px]">
				<h2 className="card-title">
					{legislator.displayName} ({legislator.party.slug}-{state.shortName})
				</h2>
				<dl>
					<dt>State Population</dt>
					<dd>5000</dd>
					<dt>Scaled Vote</dt>
					<dd>35</dd>
					<dt>Years In Congress</dt>
					<dd>25</dd>
				</dl>
				<a href="https://www.google.com">Voting History</a>

			</div>
		</div>
	</div>) 
}