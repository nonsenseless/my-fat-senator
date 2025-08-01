import { BallotViewModel } from '@my-fat-senator/lib/interfaces';
import React from 'react';
import tinyinvariant from 'tiny-invariant';


interface BallotPopupProps {
	ballot: BallotViewModel
}
export const BallotPopup: React.FC<BallotPopupProps> = (props) => {
	tinyinvariant(props.ballot, "Ballot is required");
	const ballot = props.ballot;
	tinyinvariant(ballot.legislator, "Ballot legislator is required");
	const legislator = ballot.legislator;
	tinyinvariant(legislator.state, "Ballot legislator state is required");
	const state = legislator.state;

	// Format population number with commas
	const formatPopulation = (population: number) => {
		return population.toLocaleString();
	};

	// Calculate percentage of total population (assuming we have access to total)
	const populationPercentage = ballot.population > 0 ? 
		((ballot.population / 331000000) * 100).toFixed(2) : '0.00'; // Using 2020 US population as default

	return (<div className={`absolute`} style={{ left: ballot.x + 'px', top: ballot.y + 'px' }}>
		<div className="card card-side w-96 bg-base-100 shadow-xl ballot-popup">
			<figure className={'h-[100[px] w-[100px]'}>
				<img className={'h-full w-full'}
					src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
					alt={`Portrait of Senator ${legislator.lastName}`} />
			</figure>
			<div className="card-body  pt-[10px] pb-[10px]">
				<h2 className="card-title">
					{legislator.displayName} ({legislator.party.slug}-{state.shortName})
				</h2>
				<dl>
					<dt>State Population</dt>
					<dd>{formatPopulation(ballot.population)}</dd>
					<dt>Population %</dt>
					<dd>{populationPercentage}%</dd>
					<dt>Ballot Size</dt>
					<dd>{Math.round(ballot.scaledRadius)}px</dd>
					<dt>Vote Choice</dt>
					<dd>{ballot.ballotChoiceType.name}</dd>
				</dl>
				<a href="https://www.google.com">Voting History</a>

			</div>
		</div>
	</div>) 
}