import React from 'react';

import { BallotGroups } from './vote-ballots';

interface VoteBallotsListProps {
	ballotGroups: BallotGroups;
	height: number;
}

function formatLabel(slug: string): string {
	return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function partyClass(partySlug: string): string {
	if (partySlug === 'r' || partySlug === 'R') return 'r-party-list-item';
	if (partySlug === 'd' || partySlug === 'D') return 'd-party-list-item';
	return '';
}

const GROUP_ORDER: { key: keyof BallotGroups; slug: string }[] = [
	{ key: 'yea', slug: 'yea' },
	{ key: 'nay', slug: 'nay' },
	{ key: 'notVoting', slug: 'not_voting' },
	{ key: 'present', slug: 'present' },
];

export const VoteBallotsList: React.FC<VoteBallotsListProps> = ({ ballotGroups, height }) => {
	return (
		<div className="overflow-y-auto w-full ballots-list" style={{ maxHeight: height }}>
			<table className="table table-xs w-full">
				<thead className="sticky top-0 bg-base-200 z-10">
					<tr>
						<th></th>
						<th>Name</th>
						<th>Party</th>
						<th>State</th>
						<th>Vote</th>
					</tr>
				</thead>
				<tbody>
					{GROUP_ORDER.map(({ key, slug }) => {
						const ballots = ballotGroups[key];
						if (ballots.length === 0) return null;
						return (
							<React.Fragment key={key}>
								<tr className="bg-base-300">
									<td colSpan={5} className="font-semibold text-xs uppercase tracking-wide">
										{formatLabel(slug)} ({ballots.length})
									</td>
								</tr>
								{ballots.map((ballot, i) => {
									const leg = ballot.legislator;
									return (
										<tr key={`${key}-${i}`} className={`hover ${partyClass(leg.party.slug)}`}>
											<td className="w-8 p-0.5">
												<div className="avatar">
													<div className="w-6 h-6 rounded-full">
														<img
															src={leg.depiction?.imageUrl ?? "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
															alt={leg.lastName ?? ''}
														/>
													</div>
												</div>
											</td>
											<td className="text-xs">{leg.displayName}</td>
											<td className="text-xs">{leg.party.slug.toUpperCase()}</td>
											<td className="text-xs">{leg.state.shortName}</td>
											<td className="text-xs">{formatLabel(slug)}</td>
										</tr>
									);
								})}
							</React.Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
